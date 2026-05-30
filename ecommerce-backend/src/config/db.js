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

export default db;
