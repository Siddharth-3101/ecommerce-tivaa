import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// Auto-migrate schema on connection to ensure live DB supports large text and multiple images
db.query(`
  ALTER TABLE products 
  MODIFY description LONGTEXT,
  MODIFY image_url LONGTEXT,
  MODIFY variations LONGTEXT,
  MODIFY features LONGTEXT;
`, (err) => {
  if (err) {
    console.error("Auto-migration note (can be ignored if already updated):", err.message);
  } else {
    console.log("Database schema successfully verified/upgraded for large text fields.");
  }
});

// Auto-migrate orders table schema to include processing and refunded statuses
db.query(`
  ALTER TABLE orders 
  MODIFY COLUMN order_status ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending';
`, (err) => {
  if (err) {
    console.error("Auto-migration orders note:", err.message);
  } else {
    console.log("Orders schema successfully updated for extra statuses.");
  }
});

// Auto-migrate settings table
db.query(`
  CREATE TABLE IF NOT EXISTS settings (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` LONGTEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error("Auto-migration settings note:", err.message);
  } else {
    console.log("Settings table successfully verified/created.");
  }
});

// Auto-migrate orders table schema to include shipping_cost
db.query(`
  ALTER TABLE orders 
  ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00;
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration orders shipping_cost note:", err.message);
    }
  } else {
    console.log("Orders schema successfully updated for shipping_cost.");
  }
});

// Auto-migrate orders table schema to include order_type
db.query(`
  ALTER TABLE orders 
  ADD COLUMN order_type ENUM('Online', 'Store') DEFAULT 'Online';
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration orders order_type note:", err.message);
    }
  } else {
    console.log("Orders schema successfully updated for order_type.");
  }
});

// Auto-migrate settings value column to LONGTEXT
db.query(`
  ALTER TABLE settings 
  MODIFY COLUMN \`value\` LONGTEXT NOT NULL;
`, (err) => {
  if (err) {
    console.error("Auto-migration settings value modification note:", err.message);
  } else {
    console.log("Settings value column successfully modified to LONGTEXT.");
  }
});

export default db;
