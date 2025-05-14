require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./data/complex_db.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'missing-key');

// Cache for database schema
let cachedSchema = null;

// Helper function to get database schema
async function getDatabaseSchema() {
  if (cachedSchema) {
    console.log('Using cached schema');
    return cachedSchema;
  }
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
          cachedSchema = schema;
          resolve(schema);
        })
        .catch(reject);
    });
  });
}

// Helper function to execute SQL queries
function executeQuery(query) {
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

// Helper function to generate responses with Gemini
async function generateWithGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error Details:", error);
    throw new Error(`Failed to generate response from Gemini: ${error.message}`);
  }
}

// Helper function to clean SQL query
function cleanSqlQuery(query) {
  let cleanedQuery = query.replace(/```sql/g, '').replace(/```/g, '').trim();
  cleanedQuery = cleanedQuery.replace(/--.*?(?=\n|$)/g, '').trim();
  cleanedQuery = cleanedQuery.replace(/;$/g, '');
  return cleanedQuery;
}

// Determine best visualization type
function determineVisualizationType(data) {
  if (!data || data.length === 0) return 'table';
  
  const columns = Object.keys(data[0] || {});
  if (columns.length === 2) {
    const secondCol = data[0][columns[1]];
    if (typeof secondCol === 'number') {
      return columns[0].toLowerCase().includes('date') ? 'line' : 'bar';
    }
  }
  return 'table';
}

// API endpoint to handle natural language queries
app.post('/api/query', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    console.log('Received question:', question);

    // Step 1: Get schema
    console.log('Fetching database schema...');
    const schema = await getDatabaseSchema();
    console.log('Schema retrieved:', schema);

    // Step 2: Generate SQL with Gemini
    console.log('Generating SQL query with Gemini...');
    const sqlPrompt = `
      You are a SQL expert. Given this database schema:
      ${schema}
      
      Generate a SQL query to answer: "${question}"
      Return ONLY the raw SQL query as a plain string, without any Markdown formatting (e.g., no \`\`\`sql or \`\`\`), comments, or additional text.
      Use lowercase for SQL functions (e.g., strftime, not STRFTIME).
      Note: For order status, use 'complete' (not 'completed') to indicate successful transactions.
    `;
    
    const sqlQuery = await generateWithGemini(sqlPrompt);
    console.log('Generated SQL query (before cleaning):', sqlQuery);
    const cleanedSqlQuery = cleanSqlQuery(sqlQuery);
    console.log('Cleaned SQL query:', cleanedSqlQuery);

    // Step 3: Execute query
    console.log('Executing SQL query...');
    const data = await executeQuery(cleanedSqlQuery);
    console.log('Query results:', data);

    // Step 4: Generate explanation with Gemini
    console.log('Generating explanation with Gemini...');
    const explanationPrompt = `
      Question: ${question}
      SQL Query: ${cleanedSqlQuery}
      Query Results (first 3 rows): ${JSON.stringify(data.slice(0, 3))}
      
      Explain these results in business terms in 1 short paragraph (50-100 words).
      Highlight key insights and trends.
    `;
    
    const explanation = await generateWithGemini(explanationPrompt);
    console.log('Explanation generated:', explanation);

    // Step 5: Send response
    res.json({
      question,
      sqlQuery: cleanedSqlQuery,
      data,
      explanation,
      visualizationType: determineVisualizationType(data)
    });
    
  } catch (error) {
    console.error("Error in /api/query:", error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});