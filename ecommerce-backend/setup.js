import db from "./src/config/db.js";

const setup = async () => {
    try {
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Added is_active to products");

        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_product (user_id, product_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Wishlists table created");

        process.exit(0);
    } catch (err) {
        console.error("Setup failed", err);
        process.exit(1);
    }
};

setup();
