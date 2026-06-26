import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

const sql = "ALTER TABLE orders MODIFY COLUMN order_status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending'";

db.query(sql, (err, result) => {
    if (err) {
        console.error("ALTER failed:", err);
    } else {
        console.log("ALTER succeeded:", result);
    }
    db.end();
});
