const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database('./data/ecommerce_db_v2.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// Create tables with bad schema, unnamed columns, and dirty data
db.serialize(() => {
  // Create sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      sale_id INTEGER PRIMARY KEY,
      date_of_sale TEXT,
      custid INTEGER,
      amt REAL,
      status_code TEXT
    )
  `);

  // Create clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      client_id INTEGER PRIMARY KEY,
      client_name TEXT,
      email_addr TEXT,
      signup_date TEXT,
      loc TEXT
    )
  `);

  // Create items table (with unnamed column 'col1')
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      item_id INTEGER PRIMARY KEY,
      col1 TEXT, -- Unnamed column for item name
      price_per_unit REAL,
      category_id_ref INTEGER,
      stock_qty INTEGER
    )
  `);

  // Create sale_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      sale_ref INTEGER,
      item_ref INTEGER,
      qty_sold INTEGER,
      unit_price_at_sale REAL
    )
  `);

  // Create categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      cat_id INTEGER PRIMARY KEY,
      cat_name TEXT,
      desc TEXT
    )
  `);

  // Create suppliers table
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      sup_id INTEGER PRIMARY KEY,
      sup_name TEXT,
      contact TEXT,
      last_delivery TEXT
    )
  `);

  // Create item_suppliers table
  db.run(`
    CREATE TABLE IF NOT EXISTS item_suppliers (
      item_ref INTEGER,
      sup_ref INTEGER,
      supply_price REAL
    )
  `);

  // Insert data with more diversity and dirty data
  // Categories
  db.run("INSERT INTO categories (cat_id, cat_name, desc) VALUES (1, 'Necklaces', 'Silver necklaces')");
  db.run("INSERT INTO categories (cat_id, cat_name, desc) VALUES (2, 'necklaces', NULL)"); // Duplicate
  db.run("INSERT INTO categories (cat_id, cat_name, desc) VALUES (3, 'Rings', 'Silver rings')");
  db.run("INSERT INTO categories (cat_id, cat_name, desc) VALUES (4, 'Earrings', 'Earrings desc')");
  db.run("INSERT INTO categories (cat_id, cat_name, desc) VALUES (5, 'Bracelets', NULL)");

  // Items
  db.run("INSERT INTO items (item_id, col1, price_per_unit, category_id_ref, stock_qty) VALUES (1, 'Silver Necklace', 1500.00, 1, 50)");
  db.run("INSERT INTO items (item_id, col1, price_per_unit, category_id_ref, stock_qty) VALUES (2, 'Silver Ring', 800.00, 3, 100)");
  db.run("INSERT INTO items (item_id, col1, price_per_unit, category_id_ref, stock_qty) VALUES (3, 'Silver Earring', 1200.00, 4, 30)");
  db.run("INSERT INTO items (item_id, col1, price_per_unit, category_id_ref, stock_qty) VALUES (4, 'Silver Bracelet', 1000.00, 5, 20)");
  db.run("INSERT INTO items (item_id, col1, price_per_unit, category_id_ref, stock_qty) VALUES (5, NULL, -500.00, 99, -5)"); // Missing name, negative price, invalid category

  // Suppliers
  db.run("INSERT INTO suppliers (sup_id, sup_name, contact, last_delivery) VALUES (1, 'SilverCraft', '9876543210', '2023-01-10')");
  db.run("INSERT INTO suppliers (sup_id, sup_name, contact, last_delivery) VALUES (2, 'JewelSource', NULL, '2023-02-15')");
  db.run("INSERT INTO suppliers (sup_id, sup_name, contact, last_delivery) VALUES (3, NULL, 'no-phone', NULL)"); // Missing name, invalid contact

  // Item-Suppliers
  db.run("INSERT INTO item_suppliers (item_ref, sup_ref, supply_price) VALUES (1, 1, 1200.00)");
  db.run("INSERT INTO item_suppliers (item_ref, sup_ref, supply_price) VALUES (2, 1, 600.00)");
  db.run("INSERT INTO item_suppliers (item_ref, sup_ref, supply_price) VALUES (3, 2, 900.00)");
  db.run("INSERT INTO item_suppliers (item_ref, sup_ref, supply_price) VALUES (4, 2, 800.00)");
  db.run("INSERT INTO item_suppliers (item_ref, sup_ref, supply_price) VALUES (5, 3, NULL)"); // Missing price

  // Clients (10 unique clients)
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (1, 'Priya Sharma', 'priya@example.com', '2022-01-15', 'Mumbai')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (2, 'Amit Patel', 'amit@example.com', '2022-02-01', 'Ahmedabad')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (3, 'Neha Gupta', 'neha@example.com', '2022-03-10', 'Delhi')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (4, 'Rohan Desai', 'rohan@example.com', '2022-04-05', 'Pune')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (5, 'Sanya Mehra', 'sanya@example.com', '2022-05-12', 'Bangalore')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (6, 'Karan Singh', 'karan@example.com', '2022-06-20', 'Chennai')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (7, 'Anjali Rao', 'anjali@example.com', '2022-07-15', 'Hyderabad')");
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (8, 'Vikram Joshi', NULL, NULL, NULL)"); // Missing email, date, location
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (9, 'Meera Kapoor', 'invalid-email', '2022-09-01', 'Kolkata')"); // Invalid email
  db.run("INSERT INTO clients (client_id, client_name, email_addr, signup_date, loc) VALUES (10, 'Arjun Nair', 'arjun@example.com', '2022-10-10', 'Jaipur')");

  // Sales (Enough records to cover multiple clients in 2023)
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (1, '2023-01-15', 1, 3000.00, 'shipped')"); // Priya Sharma
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (2, '2023-02-20', 2, 2400.00, 'shipped')"); // Amit Patel
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (3, '2023-03-10', 3, 1800.00, 'shipped')"); // Neha Gupta
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (4, '2023-04-05', 4, 1500.00, 'shipped')"); // Rohan Desai
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (5, '2023-05-12', 5, 1200.00, 'shipped')"); // Sanya Mehra
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (6, '2023-06-20', 6, 900.00, 'shipped')"); // Karan Singh
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (7, '2023-07-15', 7, 600.00, 'pending')"); // Anjali Rao (excluded)
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (8, '2023-08-01', 8, 400.00, 'returned')"); // Vikram Joshi (excluded)
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (9, '2023-09-10', 9, 200.00, 'shipped')"); // Meera Kapoor
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (10, '2023-10-15', 10, -100.00, 'shipped')"); // Arjun Nair (negative amount)
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (11, '2022-12-01', 1, 5000.00, 'shipped')"); // Priya Sharma (excluded, not 2023)
  db.run("INSERT INTO sales (sale_id, date_of_sale, custid, amt, status_code) VALUES (12, NULL, 3, 999999.99, 'shipped')"); // Neha Gupta (missing date, outlier)

  // Sale Items
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (1, 1, 2, 1500.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (2, 2, 3, 800.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (3, 3, 1, 1200.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (4, 4, 1, 1000.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (5, 1, 1, 1500.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (6, 2, 1, 800.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (7, 3, 1, 1200.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (8, 4, 1, 1000.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (9, 1, 1, 1500.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (10, 2, 1, 800.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (11, 1, 2, 1500.00)");
  db.run("INSERT INTO sale_items (sale_ref, item_ref, qty_sold, unit_price_at_sale) VALUES (12, 3, 100, 1200.00)");
});

console.log('Database created and populated successfully!');
db.close();