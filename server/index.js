require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
const db = new sqlite3.Database('./data/ecommerce_db_v2.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

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

// Helper function to generate responses with Ollama
async function generateWithOllama(prompt) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: prompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama Error Details:", error);
    throw new Error(`Failed to generate response from Ollama: ${error.message}`);
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

    // Step 2: Generate SQL with Ollama
    console.log('Generating SQL query with Ollama...');
    const sqlPrompt = `
      You are a SQL expert. Given this database schema:
      ${schema}
      
      Generate a SQL query to answer: "${question}"
      Return ONLY the raw SQL query as a plain string, without any Markdown formatting (e.g., no \`\`\`sql or \`\`\`), comments, or additional text.
      Use lowercase for SQL functions (e.g., strftime, not STRFTIME).
      Note: For sales status, use 'shipped' to indicate completed transactions.
      Handle inconsistencies in the schema, such as unnamed columns (e.g., col1 in items table for item name) or mismatched column names (e.g., custid in sales vs client_id in clients).
      ONLY use the tables and columns specified in the schema above. Do NOT invent tables or columns. Here are some example queries:
      
      Example 1: To find the top clients by sales amount:
      SELECT c.client_name, SUM(s.amt) AS total_spend
      FROM clients c
      JOIN sales s ON c.client_id = s.custid
      WHERE s.date_of_sale LIKE '2023%'
        AND s.status_code = 'shipped'
      GROUP BY c.client_id, c.client_name
      ORDER BY total_spend DESC
      LIMIT 5
      
      Example 2: To find monthly sales trends for a category:
      SELECT strftime('%Y-%m', s.date_of_sale) AS sales_month, SUM(s.amt) AS total_revenue
      FROM sales s
      JOIN sale_items si ON s.sale_id = si.sale_ref
      JOIN items i ON si.item_ref = i.item_id
      JOIN categories c ON i.category_id_ref = c.cat_id
      WHERE s.date_of_sale LIKE '2023%'
        AND (c.cat_name = 'Necklaces' OR c.cat_name = 'necklaces')
        AND s.status_code = 'shipped'
      GROUP BY sales_month
      ORDER BY sales_month
      
      Example 3: To find items with the highest return rate:
      SELECT i.col1 AS item_name,
             SUM(CASE WHEN s.status_code = 'returned' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) AS return_rate
      FROM sales s
      JOIN sale_items si ON s.sale_id = si.sale_ref
      JOIN items i ON si.item_ref = i.item_id
      WHERE s.date_of_sale LIKE '2023%'
      GROUP BY i.item_id, i.col1
      ORDER BY return_rate DESC
      LIMIT 5
    `;
    
    const sqlQuery = await generateWithOllama(sqlPrompt);
    console.log('Generated SQL query (before cleaning):', sqlQuery);
    const cleanedSqlQuery = cleanSqlQuery(sqlQuery);
    console.log('Cleaned SQL query:', cleanedSqlQuery);

    // Step 3: Execute query
    console.log('Executing SQL query...');
    const data = await executeQuery(cleanedSqlQuery);
    console.log('Query results:', data);

    // Step 4: Generate explanation with Ollama
    console.log('Generating explanation with Ollama...');
    const explanationPrompt = `
      Question: ${question}
      SQL Query: ${cleanedSqlQuery}
      Query Results (first 3 rows): ${JSON.stringify(data.slice(0, 3))}
      
      Explain these results in business terms in 1 short paragraph (50-100 words).
      Highlight key insights and trends.
      Account for potential data issues (e.g., missing values, outliers) in the explanation.
    `;
    
    const explanation = await generateWithOllama(explanationPrompt);
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