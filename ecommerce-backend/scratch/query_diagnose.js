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

const sql = `
  SELECT 
    c.id AS cart_id,
    c.user_id,
    c.product_id,
    c.quantity AS cart_qty,
    c.selected_variation,
    p.name AS product_name,
    p.stock AS product_stock
  FROM cart c
  JOIN products p ON p.id = c.product_id
`;

db.query(sql, (err, rows) => {
    if (err) {
        console.error('Error fetching cart:', err);
    } else {
        console.log('Cart Items in DB:');
        console.log(JSON.stringify(rows, null, 2));
    }
    db.end();
});
