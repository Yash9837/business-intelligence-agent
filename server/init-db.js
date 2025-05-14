const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/complex_db.sqlite');

// Create tables and insert data
db.serialize(() => {
  // Create messy tables with vague names
  db.run(`
    CREATE TABLE IF NOT EXISTS tbl1 (
      id INTEGER PRIMARY KEY,
      cust_id INTEGER,
      order_date TEXT,
      amount REAL,
      status TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS data2 (
      cid INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT,
      segment TEXT,
      join_date TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS report3 (
      pid INTEGER PRIMARY KEY,
      pname TEXT,
      category TEXT,
      price REAL,
      stock INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS log4 (
      oid INTEGER,
      pid INTEGER,
      qty INTEGER,
      price REAL
    )
  `);

  // Insert sample data
  db.run(`
    INSERT INTO tbl1 (id, cust_id, order_date, amount, status)
    VALUES 
      (1, 101, '2023-01-15', 150.50, 'complete'),
      (2, 102, '2023-01-16', 225.75, 'complete'),
      (3, 103, '2023-02-01', 89.99, 'returned'),
      (4, 101, '2023-02-05', 450.00, 'complete'),
      (5, 104, '2023-02-10', 120.00, 'complete')
  `);

  db.run(`
    INSERT INTO data2 (cid, name, email, segment, join_date)
    VALUES 
      (101, 'Acme Corp', 'acme@example.com', 'enterprise', '2022-01-01'),
      (102, 'XYZ Ltd', 'xyz@example.com', 'smb', '2022-06-15'),
      (103, 'John Doe', 'john@example.com', 'individual', '2023-01-01'),
      (104, 'ABC Inc', NULL, 'enterprise', '2022-11-20')
  `);

  db.run(`
    INSERT INTO report3 (pid, pname, category, price, stock)
    VALUES 
      (1, 'Widget Pro', 'Hardware', 49.99, 100),
      (2, 'Software Suite', 'Software', 199.99, 50),
      (3, 'Service Plan', 'Service', 29.99, 200),
      (4, 'Consulting', 'Service', 150.00, 10)
  `);

  db.run(`
    INSERT INTO log4 (oid, pid, qty, price)
    VALUES 
      (1, 1, 2, 49.99),
      (1, 2, 1, 199.99),
      (2, 3, 3, 29.99),
      (3, 1, 1, 49.99),
      (4, 4, 3, 150.00),
      (5, 1, 2, 49.99)
  `);

  console.log('Database created and populated successfully!');
});

db.close();