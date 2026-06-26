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

const testStatus = async (status) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE orders SET order_status = ? WHERE id = 1', [status], (err, result) => {
            if (err) {
                console.error(`❌ Update to ${status} failed:`, err.message);
                resolve(false);
            } else {
                console.log(`✅ Update to ${status} succeeded. Affected rows:`, result.affectedRows);
                resolve(true);
            }
        });
    });
};

const run = async () => {
    await testStatus('paid');
    await testStatus('processing');
    await testStatus('refunded');
    await testStatus('invalid_status');
    db.end();
};

run();
