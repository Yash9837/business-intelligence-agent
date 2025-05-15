require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors({
  origin: 'https://intelligence-agent.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// Initialize default database on Render disk
const defaultDb = new sqlite3.Database('/opt/render/db/ecommerce_db_v2.sqlite', (err) => {
  if (err) {
    console.error('Default database connection error:', err.message);
  } else {
    console.log('Default database connected successfully');
  }
});

// Temporary database for user-uploaded data
let tempDb = null;

// Cache for database schema
let cachedSchema = null;

// Helper function to get the active database
function getActiveDb(useUserData) {
  return useUserData && tempDb ? tempDb : defaultDb;
}

// Helper function to get database schema
async function getDatabaseSchema(useUserData) {
  if (cachedSchema && !useUserData) {
    console.log('Using cached schema');
    return cachedSchema;
  }
  const db = getActiveDb(useUserData);
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('Error fetching tables:', err.message);
        return reject(err);
      }
      
      let schema = "Database Schema:\n";
      const tablePromises = tables.map(table => {
        return new Promise((res, rej) => {
          db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (err) {
              console.error(`Error fetching schema for table ${table.name}:`, err.message);
              return rej(err);
            }
            schema += `\nTable "${table.name}":\n${columns.map(c => `- ${c.name} (${c.type})`).join('\n')}\n`;
            res();
          });
        });
      });

      Promise.all(tablePromises)
        .then(() => {
          if (!useUserData) cachedSchema = schema;
          resolve(schema);
        })
        .catch(reject);
    });
  });
}

// Helper function to execute SQL queries
function executeQuery(query, useUserData) {
  const db = getActiveDb(useUserData);
  return new Promise((resolve, reject) => {
    console.log('Executing query:', query);
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('SQL execution error:', err.message);
        return reject(new Error(`SQL execution failed: ${err.message}`));
      }
      resolve(rows);
    });
  });
}

// Helper function to generate responses with Gemini API
async function generateWithGemini(prompt) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30-second timeout
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0].content.parts[0].text) {
      throw new Error('Invalid response from Gemini API');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error('Gemini API rate limit exceeded. Please wait and try again or upgrade your plan.');
    } else if (error.response && error.response.status === 401) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Gemini API request timed out. Please try again later.');
    }
    console.error("Gemini API Error Details:", error.response ? error.response.data : error);
    throw new Error(`Failed to generate response from Gemini API: ${error.message}`);
  }
}

// Helper function to clean SQL query
function cleanSqlQuery(query) {
  let cleanedQuery = query.replace(/```sql/g, '').replace(/```/g, '').trim();
  cleanedQuery = cleanedQuery.replace(/--.*?(?=\n|$)/g, '').trim();
  cleanedQuery = cleanedQuery.replace(/;$/g, '');
  return cleanedQuery;
}

// Determine visualization type and axis labels
function determineVisualizationTypeAndLabels(data, question) {
  if (!data || data.length === 0) return { type: 'table', xAxis: null, yAxis: null };
  
  const columns = Object.keys(data[0] || {});
  if (columns.length === 2) {
    const secondCol = data[0][columns[1]];
    if (typeof secondCol === 'number') {
      const isTimeSeries = columns[0].toLowerCase().includes('date') || columns[0].toLowerCase().includes('month');
      return {
        type: isTimeSeries ? 'line' : 'bar',
        xAxis: isTimeSeries ? 'Date' : columns[0].charAt(0).toUpperCase() + columns[0].slice(1),
        yAxis: columns[1].charAt(0).toUpperCase() + columns[1].slice(1),
      };
    }
  }
  return { type: 'table', xAxis: null, yAxis: null };
}

// API endpoint to upload CSV
app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const records = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(req.file.path)
        .pipe(parse({ delimiter: ',', columns: true, skip_empty_lines: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => {
          fs.unlinkSync(req.file.path);
          resolve(results);
        })
        .on('error', (err) => reject(err));
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    if (tempDb) {
      tempDb.close();
    }

    tempDb = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        console.error('Temp database connection error:', err.message);
        return res.status(500).json({ error: 'Failed to create temp database' });
      }
    });

    const headers = Object.keys(records[0]);
    const columns = headers.map(header => {
      const cleanHeader = header.replace(/[^a-zA-Z0-9_]/g, '_');
      return `${cleanHeader} TEXT`;
    }).join(', ');
    const createTableQuery = `CREATE TABLE user_data (${columns})`;
    await new Promise((resolve, reject) => {
      tempDb.run(createTableQuery, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const placeholders = headers.map(() => '?').join(', ');
    const insertQuery = `INSERT INTO user_data (${headers.map(h => h.replace(/[^a-zA-Z0-9_]/g, '_')).join(', ')}) VALUES (${placeholders})`;
    for (const record of records) {
      const values = headers.map(header => record[header] || null);
      await new Promise((resolve, reject) => {
        tempDb.run(insertQuery, values, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const schema = await getDatabaseSchema(true);
    console.log('Schema of uploaded dataset:', schema);

    res.json({ message: 'CSV uploaded and processed successfully' });
  } catch (error) {
    console.error('Error processing CSV:', error.message);
    res.status(500).json({ error: 'Failed to process CSV: ' + error.message });
  }
});

// API endpoint to handle natural language queries
app.post('/api/query', async (req, res) => {
  const { question, useUserData = false } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    console.log('Received question:', question);

    // Step 1: Get schema
    console.log('Fetching database schema...');
    const schema = await getDatabaseSchema(useUserData);
    console.log('Schema retrieved:', schema);

    // Step 2: Generate SQL with Gemini API
    console.log('Generating SQL query with Gemini API...');
    const sqlPrompt = `
      You are an intelligent SQL agent capable of dynamically analyzing database schemas and generating accurate SQL queries for any dataset. Given this database schema:
      ${schema}
      
      Generate a SQL query to answer: "${question}"
      Return ONLY the raw SQL query as a plain string, without any Markdown formatting (e.g., no \`\`\`sql or \`\`\`), comments, or additional text.
      Use lowercase for SQL functions (e.g., strftime, not STRFTIME).
      
      Follow these steps to reason like a real-time AI agent:
      1. Analyze the schema to identify available tables and columns.
      2. Determine the minimal set of columns needed to answer the question.
      3. If a field mentioned in the question (e.g., 'location') doesn't exist, ignore that condition and proceed with available fields.
      4. Do NOT invent tables (e.g., 'category_data') or columns that aren't in the schema.
      5. Handle case sensitivity by using LOWER() for comparisons if needed.
      6. Exclude invalid dates (e.g., '2023-13-01') using conditions like date_of_sale NOT LIKE '%-13-%' if 'date_of_sale' exists.
      7. Handle missing values with IS NOT NULL or COALESCE where appropriate.
      8. If fields like 'status_code' or 'client_location' are referenced in the question but don't exist, skip those conditions.
      
      Example 1: For a question like "Who are our top 5 clients by total sales?" on a schema with 'client_name' and 'total_amount':
      SELECT client_name AS name, SUM(total_amount) AS total
      FROM user_data
      GROUP BY client_name
      ORDER BY total DESC
      LIMIT 5
      
      Example 2: For a question like "What is the sales trend in 2023?" if 'date_of_sale' exists:
      SELECT strftime('%Y-%m', date_of_sale) AS month, SUM(total_amount) AS total
      FROM user_data
      WHERE date_of_sale LIKE '2023%'
        AND date_of_sale NOT LIKE '%-13-%'
      GROUP BY month
      ORDER BY month
    `;
    
    const sqlQuery = await generateWithGemini(sqlPrompt);
    console.log('Generated SQL query (before cleaning):', sqlQuery);
    const cleanedSqlQuery = cleanSqlQuery(sqlQuery);
    console.log('Cleaned SQL query:', cleanedSqlQuery);

    // Step 3: Execute query
    console.log('Executing SQL query...');
    const data = await executeQuery(cleanedSqlQuery, useUserData);
    console.log('Query results:', data);

    // Step 4: Generate explanation with Gemini API
    console.log('Generating explanation with Gemini API...');
    const explanationPrompt = `
      Question: ${question}
      SQL Query: ${cleanedSqlQuery}
      Query Results (first 3 rows): ${JSON.stringify(data.slice(0, 3))}
      
      You're a business advisor! Share insights in a lively, actionable format using bullet points (3-5 points, each 10-20 words).
      - Start with a positive hook (e.g., "Great news!").
      - Highlight key trends and standout performers.
      - Suggest a bold, actionable step to capitalize on the data.
      - Note any data quirks (e.g., missing fields, outliers) with a curious tone.
      - Keep it conversational and exciting!
      If fields like 'location' were unavailable, mention the analysis was adjusted.
    `;
    
    const explanation = await generateWithGemini(explanationPrompt);
    console.log('Explanation generated:', explanation);

    // Step 5: Determine visualization type and axis labels
    const vizInfo = determineVisualizationTypeAndLabels(data, question);

    // Step 6: Send response
    res.json({
      question,
      sqlQuery: cleanedSqlQuery,
      data,
      explanation,
      visualizationType: vizInfo.type,
      xAxisLabel: vizInfo.xAxis,
      yAxisLabel: vizInfo.yAxis,
    });
    
  } catch (error) {
    console.error("Error in /api/query:", error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
    });
  }
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close databases on shutdown
process.on('SIGINT', () => {
  if (tempDb) tempDb.close();
  defaultDb.close();
  process.exit();
});