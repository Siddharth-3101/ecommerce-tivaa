import db from "./src/config/db.js";

export const runSetup = async () => {
    try {
        // 1. Create users table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                phone VARCHAR(50) NULL,
                address TEXT NULL,
                reset_token VARCHAR(255) NULL,
                reset_token_expires TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Users table verified/created");

        // 2. Create categories table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Categories table verified/created");

        // 3. Create products table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description LONGTEXT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock INT DEFAULT 0,
                category_id INT NULL,
                image_url LONGTEXT NULL,
                variations LONGTEXT NULL,
                features LONGTEXT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Products table verified/created");

        // 4. Create orders table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(100) NOT NULL,
                order_status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
                razorpay_order_id VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Orders table verified/created");

        // 5. Create order_items table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Order items table verified/created");

        // 6. Create payments table
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
        console.log("Payments table verified/created");

        // 7. Create shipping_details table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS shipping_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                shipped_date TIMESTAMP NULL,
                delivery_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Shipping details table verified/created");

        // 8. Create cart table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Cart table verified/created");

        // 9. Create wishlists table
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
        console.log("Wishlists table verified/created");

        // 10. Create reviews table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                rating INT NOT NULL,
                review TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Reviews table verified/created");

        // 11. Create contact_messages table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                reply TEXT NULL,
                status ENUM('pending', 'replied') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Contact messages table verified/created");

        // 11. Safe Column ALTER Migrations
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN category_id INT NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN features LONGTEXT NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL", (err) => {
            if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists") && !err.message.includes("FK")) {
                rej(err);
            } else {
                res();
            }
        }));
        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN address TEXT NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE orders MODIFY COLUMN order_status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending'", (err) => err ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN variations TEXT NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE cart ADD COLUMN selected_variation VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN selected_variation VARCHAR(255) NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE shipping_details ADD COLUMN shipped_date TIMESTAMP NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        await new Promise((res, rej) => db.query("ALTER TABLE shipping_details ADD COLUMN delivery_date TIMESTAMP NULL", (err) => err && !err.message.includes("Duplicate column name") ? rej(err) : res()));
        console.log("Database schema migrations verified successfully");

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
