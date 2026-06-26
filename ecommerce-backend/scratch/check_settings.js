import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'database-1.c9qo6qac08d1.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'lalitha79',
    database: 'ecommerce',
    port: 3306
});

db.query('SELECT * FROM settings', (err, rows) => {
    if (err) {
        console.error('Error querying settings table:', err);
    } else {
        console.log('Settings table contents:');
        console.log(JSON.stringify(rows, null, 2));
    }
    db.end();
});
