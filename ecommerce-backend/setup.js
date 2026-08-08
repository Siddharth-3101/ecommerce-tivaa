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
                privacy_policy_accepted BOOLEAN DEFAULT false,
                privacy_policy_accepted_on TIMESTAMP NULL,
                terms_accepted BOOLEAN DEFAULT false,
                terms_accepted_on TIMESTAMP NULL,
                marketing_consent BOOLEAN DEFAULT false,
                marketing_consent_on TIMESTAMP NULL,
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
                terms_accepted_on TIMESTAMP NULL,
                privacy_accepted_on TIMESTAMP NULL,
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

        // 14. Create user_logins table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS user_logins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("User logins table verified/created");

        // 15. Create coupons table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(100) UNIQUE NOT NULL,
                type ENUM('percentage', 'flat_amount', 'free_shipping') NOT NULL,
                value DECIMAL(10, 2) DEFAULT 0.00,
                min_bill_amount DECIMAL(10, 2) DEFAULT 0.00,
                is_active BOOLEAN DEFAULT true,
                start_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Coupons table verified/created");

        // 16. Create attributes table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS attributes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(100) UNIQUE NOT NULL,
                description TEXT NULL,
                level ENUM('Universal', 'Category', 'Subcategory') NOT NULL DEFAULT 'Universal',
                category_id INT NULL,
                subcategory_id INT NULL,
                control_type ENUM('Dropdown', 'Multi Select', 'Text', 'Number', 'Yes/No', 'Color Palette') NOT NULL DEFAULT 'Dropdown',
                display_order INT DEFAULT 0,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                show_in_filter BOOLEAN DEFAULT true,
                allow_multiple_values BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Attributes table verified/created");

        // 17. Create attribute_values table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS attribute_values (
                id INT AUTO_INCREMENT PRIMARY KEY,
                attribute_id INT NOT NULL,
                value VARCHAR(255) NOT NULL,
                code VARCHAR(100) NOT NULL,
                display_order INT DEFAULT 0,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
                UNIQUE KEY attr_val_code (attribute_id, code)
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Attribute values table verified/created");

        // 17.5. Create product_attributes table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS product_attributes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                attribute_id INT NOT NULL,
                attribute_value_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
                FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE,
                UNIQUE KEY product_attr_val (product_id, attribute_id, attribute_value_id)
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Product attributes table verified/created");

        // 17.6. Alter users table for account deletions
        await new Promise((res) => {
            db.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE'", (err) => {
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Alter users status error:", err.message);
                }
                res();
            });
        });
        await new Promise((res) => {
            db.query("ALTER TABLE users ADD COLUMN deleted_on TIMESTAMP NULL", (err) => {
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Alter users deleted_on error:", err.message);
                }
                res();
            });
        });
        await new Promise((res) => {
            db.query("ALTER TABLE users ADD COLUMN deleted_by INT NULL", (err) => {
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Alter users deleted_by error:", err.message);
                }
                res();
            });
        });

        // 17.7. Create customer_deletion_requests table
        await new Promise((res, rej) => db.query(`
            CREATE TABLE IF NOT EXISTS customer_deletion_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                reason VARCHAR(255) NULL,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP NULL,
                processed_by INT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => err ? rej(err) : res()));
        console.log("Customer deletion requests table verified/created");

        // 17.8. Alter orders table for terms/privacy acceptance timestamps
        await new Promise((res) => {
            db.query("ALTER TABLE orders ADD COLUMN terms_accepted_on TIMESTAMP NULL", (err) => {
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Alter orders terms_accepted_on error:", err.message);
                }
                res();
            });
        });
        await new Promise((res) => {
            db.query("ALTER TABLE orders ADD COLUMN privacy_accepted_on TIMESTAMP NULL", (err) => {
                if (err && !err.message.includes("duplicate column")) {
                    console.error("Alter orders privacy_accepted_on error:", err.message);
                }
                res();
            });
        });


        // Seed mock user logins if empty
        const loginsCount = await new Promise((res) => {
            db.query("SELECT COUNT(*) AS cnt FROM user_logins", (err, rows) => {
                res(err ? 0 : rows[0].cnt);
            });
        });

        if (loginsCount === 0) {
            const userIds = await new Promise((res) => {
                db.query("SELECT id FROM users LIMIT 10", (err, rows) => {
                    res(err ? [] : rows.map(r => r.id));
                });
            });

            if (userIds.length > 0) {
                const mockLogins = [];
                const now = new Date();
                
                userIds.forEach((uId) => {
                    mockLogins.push([uId, now]);
                    
                    const threeDaysAgo = new Date();
                    threeDaysAgo.setDate(now.getDate() - 3);
                    mockLogins.push([uId, threeDaysAgo]);
                    mockLogins.push([uId, threeDaysAgo]);
                    
                    const fifteenDaysAgo = new Date();
                    fifteenDaysAgo.setDate(now.getDate() - 15);
                    mockLogins.push([uId, fifteenDaysAgo]);
                    mockLogins.push([uId, fifteenDaysAgo]);
                });

                await new Promise((res) => {
                    db.query("INSERT INTO user_logins (user_id, login_time) VALUES ?", [mockLogins], (err) => {
                        if (err) console.error("Error seeding mock user logins:", err.message);
                        else console.log("Seeded mock user logins successfully.");
                        res();
                    });
                });
            }
        }

        // 13. Safe Column ALTER Migrations
        const productCols = await getExistingColumns("products");
        const userCols = await getExistingColumns("users");
        const orderCols = await getExistingColumns("orders");
        const categoryCols = await getExistingColumns("categories");
        const cartCols = await getExistingColumns("cart");
        const orderItemCols = await getExistingColumns("order_items");
        const shippingCols = await getExistingColumns("shipping_details");
        const attributeCols = await getExistingColumns("attributes");
        const attributeValueCols = await getExistingColumns("attribute_values");

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
        if (!userCols.includes("privacy_policy_accepted")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN privacy_policy_accepted BOOLEAN DEFAULT false", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("privacy_policy_accepted_on")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN privacy_policy_accepted_on TIMESTAMP NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("terms_accepted")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT false", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("terms_accepted_on")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN terms_accepted_on TIMESTAMP NULL", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("marketing_consent")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN marketing_consent BOOLEAN DEFAULT false", (err) => err ? rej(err) : res()));
        }
        if (!userCols.includes("marketing_consent_on")) {
            await new Promise((res, rej) => db.query("ALTER TABLE users ADD COLUMN marketing_consent_on TIMESTAMP NULL", (err) => err ? rej(err) : res()));
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
        if (!orderCols.includes("coupon_code")) {
            await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(100) NULL", (err) => err ? rej(err) : res()));
            console.log("Migration: added coupon_code to orders");
        }
        if (!orderCols.includes("discount_amount")) {
            await new Promise((res, rej) => db.query("ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00", (err) => err ? rej(err) : res()));
            console.log("Migration: added discount_amount to orders");
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

        // 14. Attributes Table ALTER Migrations
        if (attributeCols.length > 0) {
            if (!attributeCols.includes("code")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN code VARCHAR(100) NULL", (err) => err ? rej(err) : res()));
                await new Promise((res) => {
                    db.query("UPDATE attributes SET code = UPPER(REPLACE(TRIM(name), ' ', '_')) WHERE code IS NULL OR code = ''", () => res());
                });
                await new Promise((res, rej) => db.query("ALTER TABLE attributes MODIFY COLUMN code VARCHAR(100) NOT NULL UNIQUE", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("description")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN description TEXT NULL", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("level")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN level ENUM('Universal', 'Category', 'Subcategory') NOT NULL DEFAULT 'Universal'", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("category_id")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN category_id INT NULL", (err) => err ? rej(err) : res()));
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD CONSTRAINT fk_attributes_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL", (err) => {
                    if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists") && !err.message.includes("FK")) {
                        rej(err);
                    } else {
                        res();
                    }
                }));
            }
            if (!attributeCols.includes("subcategory_id")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN subcategory_id INT NULL", (err) => err ? rej(err) : res()));
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD CONSTRAINT fk_attributes_subcategory FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL", (err) => {
                    if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists") && !err.message.includes("FK")) {
                        rej(err);
                    } else {
                        res();
                    }
                }));
            }
            if (!attributeCols.includes("control_type")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN control_type ENUM('Dropdown', 'Multi Select', 'Text', 'Number', 'Yes/No', 'Color Palette') NOT NULL DEFAULT 'Dropdown'", (err) => err ? rej(err) : res()));
            } else {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes MODIFY COLUMN control_type ENUM('Dropdown', 'Multi Select', 'Text', 'Number', 'Yes/No', 'Color Palette') NOT NULL DEFAULT 'Dropdown'", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("display_order")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN display_order INT DEFAULT 0", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("status")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN status ENUM('Active', 'Inactive') DEFAULT 'Active'", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("show_in_filter")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN show_in_filter BOOLEAN DEFAULT true", (err) => err ? rej(err) : res()));
            }
            if (!attributeCols.includes("allow_multiple_values")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attributes ADD COLUMN allow_multiple_values BOOLEAN DEFAULT false", (err) => err ? rej(err) : res()));
                console.log("Migration: added allow_multiple_values to attributes");
            }
        }

        // 15. Attribute Values Table ALTER Migrations
        if (attributeValueCols.length > 0) {
            if (!attributeValueCols.includes("code")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attribute_values ADD COLUMN code VARCHAR(100) NULL", (err) => err ? rej(err) : res()));
                await new Promise((res) => {
                    db.query("UPDATE attribute_values SET code = UPPER(REPLACE(TRIM(value), ' ', '_')) WHERE code IS NULL OR code = ''", () => res());
                });
                await new Promise((res, rej) => db.query("ALTER TABLE attribute_values MODIFY COLUMN code VARCHAR(100) NOT NULL", (err) => err ? rej(err) : res()));
                await new Promise((res, rej) => db.query("ALTER TABLE attribute_values ADD CONSTRAINT attr_val_code UNIQUE KEY (attribute_id, code)", (err) => {
                    if (err && !err.message.includes("Duplicate") && !err.message.includes("already exists")) {
                        rej(err);
                    } else {
                        res();
                    }
                }));
            }
            if (!attributeValueCols.includes("display_order")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attribute_values ADD COLUMN display_order INT DEFAULT 0", (err) => err ? rej(err) : res()));
            }
            if (!attributeValueCols.includes("status")) {
                await new Promise((res, rej) => db.query("ALTER TABLE attribute_values ADD COLUMN status ENUM('Active', 'Inactive') DEFAULT 'Active'", (err) => err ? rej(err) : res()));
            }
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
