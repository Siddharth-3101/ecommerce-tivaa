import db from "./src/config/db.js";

export const runSetup = async () => {
    try {
        // Ensure products is_active column exists
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Added is_active to products");

        // Ensure users phone and address columns exist
        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Added phone to users");

        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN address TEXT NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Added address to users");

        // Ensure razorpay_order_id is in orders table
        await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Added razorpay_order_id to orders table");

        // Create payments table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                provider VARCHAR(50) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) NOT NULL,
                payment_reference VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Payments table verified/created successfully");

        // Create wishlists table
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
    } catch (err) {
        console.error("Setup failed:", err);
        throw err;
    }
};

// Check if run directly
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
    process.argv[1] === fileURLToPath(import.meta.url) || 
    process.argv[1].endsWith('setup.js')
);

if (isMain) {
    runSetup()
        .then(() => {
            console.log("Setup completed successfully.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Setup failed:", err);
            process.exit(1);
        });
}
