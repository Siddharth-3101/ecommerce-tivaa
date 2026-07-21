import db from "./src/config/db.js";

const getExistingColumns = async (tableName) => {
    return new Promise((resolve) => {
        db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, rows) => {
            if (err) {
                resolve([]);
            } else {
                resolve(rows.map(r => r.Field.toLowerCase()));
            }
        });
    });
};

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
                city VARCHAR(100) NULL,
                state VARCHAR(100) NULL,
                pincode VARCHAR(20) NULL,
                reset_token VARCHAR(255) NULL,
                reset_token_expires TIMESTAMP NULL,
                auth_provider VARCHAR(50) DEFAULT 'local',
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
                parent_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
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
                purchase_price DECIMAL(10, 2) NULL,
                discounted_price DECIMAL(10, 2) NULL,
                stock INT DEFAULT 0,
                category_id INT NULL,
                image_url LONGTEXT NULL,
                variations LONGTEXT NULL,
                features LONGTEXT NULL,
                is_active BOOLEAN DEFAULT true,
                is_visible BOOLEAN DEFAULT true,
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
                shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
                payment_method VARCHAR(100) NOT NULL,
                order_status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
                order_type ENUM('Online', 'Store') DEFAULT 'Online',
                razorpay_order_id VARCHAR(255) NULL,
                invoice_number VARCHAR(255) NULL,
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
                selected_variation VARCHAR(255) NULL,
                gst_rate DECIMAL(5, 2) DEFAULT 0.00,
                taxable_amount DECIMAL(10, 2) DEFAULT 0.00,
                cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
                sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
                igst_amount DECIMAL(10, 2) DEFAULT 0.00,
                gst_state_name VARCHAR(255) NULL,
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
                phone VARCHAR(50) NULL,
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

        // 12. Create hsn_codes table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS hsn_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hsn_code VARCHAR(255) NOT NULL,
                hsn_name VARCHAR(255) NOT NULL,
                tax_percentage DECIMAL(5, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("HSN codes table verified/created");

        // 13. Create gst_states table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS gst_states (
                id INT AUTO_INCREMENT PRIMARY KEY,
                state_code VARCHAR(50) NOT NULL,
                state_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("GST states table verified/created");

        // 13. Safe Column ALTER Migrations
        const productCols = await getExistingColumns("products");
        const userCols = await getExistingColumns("users");
        const orderCols = await getExistingColumns("orders");
        const categoryCols = await getExistingColumns("categories");
        const cartCols = await getExistingColumns("cart");
        const orderItemCols = await getExistingColumns("order_items");
        const shippingCols = await getExistingColumns("shipping_details");

        if (!productCols.includes("is_active")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true", (err) => err ? rej(err) : res()));
        }
        if (!productCols.includes("purchase_price")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN purchase_price DECIMAL(10, 2) NULL", (err) => err ? rej(err) : res()));
            console.log("Migration: added purchase_price to products");
        }
        if (!productCols.includes("discounted_price")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN discounted_price DECIMAL(10, 2) NULL", (err) => err ? rej(err) : res()));
            console.log("Migration: added discounted_price to products");
        }
        if (!productCols.includes("category_id")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN category_id INT NULL", (err) => err ? rej(err) : res()));
        }
        if (!productCols.includes("features")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN features LONGTEXT NULL", (err) => err ? rej(err) : res()));
        }
        if (!productCols.includes("purchased_from")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN purchased_from VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
            console.log("Migration: added purchased_from to products");
        }
        
        await new Promise((res, rej) => db.query("ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL", (err) => {
            if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists") && !err.message.includes("FK")) {
                rej(err);
            } else {
                res();
            }
        }));

        if (!userCols.includes("phone")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("address")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN address TEXT NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("city")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("state")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN state VARCHAR(100) NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("pincode")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN pincode VARCHAR(20) NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("reset_token")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("reset_token_expires")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("auth_provider")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'", (err) => err ? rej(err) : res()));
        }

        if (!orderCols.includes("razorpay_order_id")) {
            await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }
        if (!orderCols.includes("shipping_cost")) {
            await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderCols.includes("order_type")) {
            await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN order_type ENUM('Online', 'Store') DEFAULT 'Online'", (err) => err ? rej(err) : res()));
            console.log("Migration: added order_type to orders");
        }
        
        await new Promise((res, rej) => db.query("ALTER TABLE orders MODIFY COLUMN order_status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending'", (err) => err ? rej(err) : res()));

        if (!categoryCols.includes("image_url")) {
            await new Promise((res, rej) => db.query("ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }

        if (!categoryCols.includes("show_in_homepage")) {
            await new Promise((res, rej) => db.query("ALTER TABLE categories ADD COLUMN show_in_homepage BOOLEAN DEFAULT false", (err) => err ? rej(err) : res()));
            console.log("Migration: added show_in_homepage to categories");
        }

        if (!categoryCols.includes("hsn_id")) {
            await new Promise((res, rej) => db.query("ALTER TABLE categories ADD COLUMN hsn_id INT NULL", (err) => err ? rej(err) : res()));
            await new Promise((res, rej) => db.query("ALTER TABLE categories ADD CONSTRAINT fk_categories_hsn FOREIGN KEY (hsn_id) REFERENCES hsn_codes(id) ON DELETE SET NULL", (err) => {
                if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists")) {
                    rej(err);
                } else {
                    res();
                }
            }));
            console.log("Migration: added hsn_id to categories");
        }

        if (!productCols.includes("variations")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN variations TEXT NULL", (err) => err ? rej(err) : res()));
        }

        if (!cartCols.includes("selected_variation")) {
            await new Promise((res, rej) => db.query("ALTER TABLE cart ADD COLUMN selected_variation VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }

        if (!orderItemCols.includes("selected_variation")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN selected_variation VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("gst_rate")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("taxable_amount")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN taxable_amount DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("cgst_amount")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN cgst_amount DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("sgst_amount")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN sgst_amount DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("igst_amount")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN igst_amount DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
        }
        if (!orderItemCols.includes("gst_state_name")) {
            await new Promise((res, rej) => db.query("ALTER TABLE order_items ADD COLUMN gst_state_name VARCHAR(255) NULL", (err) => err ? rej(err) : res()));
        }

        if (!shippingCols.includes("shipped_date")) {
            await new Promise((res, rej) => db.query("ALTER TABLE shipping_details ADD COLUMN shipped_date TIMESTAMP NULL", (err) => err ? rej(err) : res()));
        }
        if (!shippingCols.includes("delivery_date")) {
            await new Promise((res, rej) => db.query("ALTER TABLE shipping_details ADD COLUMN delivery_date TIMESTAMP NULL", (err) => err ? rej(err) : res()));
        }
        if (!shippingCols.includes("phone")) {
            await new Promise((res, rej) => db.query("ALTER TABLE shipping_details ADD COLUMN phone VARCHAR(50) NULL", (err) => err ? rej(err) : res()));
        }

        if (!productCols.includes("is_visible")) {
            await new Promise((res, rej) => db.query("ALTER TABLE products ADD COLUMN is_visible BOOLEAN DEFAULT true", (err) => err ? rej(err) : res()));
        }
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
