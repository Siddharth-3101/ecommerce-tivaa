import db from './src/config/db.js';
db.query('SELECT * FROM categories', (err, rows) => {
    console.log(rows);
    process.exit();
});
