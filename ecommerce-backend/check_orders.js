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

db.query('SELECT id, order_status FROM orders', (err, rows) => {
    if (err) {
        console.error('Error fetching orders:', err);
    } else {
        console.log('Orders in DB:', rows);
    }
    db.end();
});
