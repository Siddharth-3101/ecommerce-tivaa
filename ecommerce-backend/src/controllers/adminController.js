import db from "../config/db.js";
import { sendOrderEmailToCustomer } from "../utils/orderEmail.js";

// ===========================================================
// CATEGORY MANAGEMENT
// ===========================================================

// Add Category
export const addCategory = (req, res) => {
    const { name, description, image_url, parent_id } = req.body;

    if (!name)
        return res.status(400).json({ message: "Category name required" });

    const targetParentId = parent_id ? Number(parent_id) : null;

    const performInsert = () => {
        const sql = "INSERT INTO categories (name, description, image_url, parent_id) VALUES (?, ?, ?, ?)";

        db.query(sql, [name, description || null, image_url || null, targetParentId], (err) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ message: "DB error" });
            }
            res.json({ message: "Category added" });
        });
    };

    if (targetParentId) {
        db.query("SELECT parent_id FROM categories WHERE id = ?", [targetParentId], (err, rows) => {
            if (err) {
                console.error("DB error checking parent:", err);
                return res.status(500).json({ message: "DB error" });
            }
            if (rows.length === 0) {
                return res.status(400).json({ message: "Selected parent category does not exist." });
            }
            if (rows[0].parent_id !== null) {
                return res.status(400).json({ message: "The selected parent category is itself a sub-category. We only support a 2-level hierarchy." });
            }
            performInsert();
        });
    } else {
        performInsert();
    }
};

// Delete Category
export const deleteCategory = (req, res) => {
    const { id } = req.params;

    // Check if any active products belong to this category
    const checkSql = "SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = true";
    db.query(checkSql, [id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error("DB error checking products:", checkErr);
            return res.status(500).json({ message: "DB error" });
        }

        if (checkResult[0] && checkResult[0].count > 0) {
            return res.status(400).json({ 
                message: "Cannot delete category because it contains active products. Please reassign or delete the products first." 
            });
        }

        // Check if any sub-categories belong to this category
        const checkSubSql = "SELECT COUNT(*) as count FROM categories WHERE parent_id = ?";
        db.query(checkSubSql, [id], (subCheckErr, subCheckResult) => {
            if (subCheckErr) {
                console.error("DB error checking sub-categories:", subCheckErr);
                return res.status(500).json({ message: "DB error" });
            }

            if (subCheckResult[0] && subCheckResult[0].count > 0) {
                return res.status(400).json({
                    message: "Cannot delete category because it contains active sub-categories. Please delete or reassign the sub-categories first."
                });
            }

            const sql = "DELETE FROM categories WHERE id = ?";
            db.query(sql, [id], (err, result) => {
                if (err) {
                    console.error("DB error:", err);
                    return res.status(500).json({ message: "DB error" });
                }

                if (result.affectedRows === 0)
                    return res.status(404).json({ message: "Category not found" });

                res.json({ message: "Category deleted" });
            });
        });
    });
};

// Update Category
export const updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, description, image_url, parent_id } = req.body;

    const targetParentId = parent_id ? Number(parent_id) : null;

    if (targetParentId && targetParentId === Number(id)) {
        return res.status(400).json({ message: "A category cannot be its own parent." });
    }

    const performUpdate = () => {
        const sql =
            "UPDATE categories SET name = ?, description = ?, image_url = ?, parent_id = ? WHERE id = ?";

        db.query(sql, [name, description, image_url || null, targetParentId, id], (err, result) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ message: "DB error" });
            }

            if (result.affectedRows === 0)
                return res.status(404).json({ message: "Category not found" });

            res.json({ message: "Category updated" });
        });
    };

    if (targetParentId) {
        // 1. Verify parent category exists and is a top-level category (parent_id is null)
        db.query("SELECT parent_id FROM categories WHERE id = ?", [targetParentId], (err, rows) => {
            if (err) {
                console.error("DB error checking parent:", err);
                return res.status(500).json({ message: "DB error" });
            }
            if (rows.length === 0) {
                return res.status(400).json({ message: "Selected parent category does not exist." });
            }
            if (rows[0].parent_id !== null) {
                return res.status(400).json({ message: "The selected parent category is itself a sub-category. We only support a 2-level hierarchy." });
            }

            // 2. Ensure this category does not have sub-categories (if it does, it cannot become a sub-category)
            db.query("SELECT COUNT(*) as count FROM categories WHERE parent_id = ?", [id], (err2, rows2) => {
                if (err2) {
                    console.error("DB error checking child sub-categories:", err2);
                    return res.status(500).json({ message: "DB error" });
                }
                if (rows2[0] && rows2[0].count > 0) {
                    return res.status(400).json({ message: "This category cannot become a sub-category because it already contains sub-categories." });
                }
                
                performUpdate();
            });
        });
    } else {
        performUpdate();
    }
};

// ===========================================================
// ADMIN: VIEW ALL ORDERS
// ===========================================================

export const adminGetOrders = (req, res) => {
    const sql = `
        SELECT 
            o.id,
            o.user_id,
            u.name AS customer,
            u.email,
            o.total,
            o.order_status,
            o.payment_method,
            o.created_at,
            o.razorpay_order_id,
            pay.payment_reference AS payment_id
        FROM orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN payments pay ON pay.order_id = o.id
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows);
    });
};

// ===========================================================
// ADMIN: ORDER DETAILS
// ===========================================================

export const adminOrderDetails = (req, res) => {
    const { id } = req.params;

    const sqlOrder = `
        SELECT 
            o.*, 
            u.name AS customer_name, 
            u.email AS customer_email,
            s.address, s.city, s.state, s.pincode, s.phone,
            s.shipped_date, s.delivery_date,
            pay.payment_reference AS payment_id
        FROM orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN shipping_details s ON s.order_id = o.id
        LEFT JOIN payments pay ON pay.order_id = o.id
        WHERE o.id = ?
    `;

    const sqlItems = `
        SELECT 
            oi.product_id,
            p.name,
            p.image_url,
            oi.quantity,
            oi.price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
    `;

    db.query(sqlOrder, [id], (err, orderResult) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }

        if (orderResult.length === 0)
            return res.status(404).json({ message: "Order not found" });

        db.query(sqlItems, [id], (err2, itemResults) => {
            if (err2) {
                console.error("DB error:", err2);
                return res.status(500).json({ message: "DB error" });
            }

            res.json({
                order: orderResult[0],
                items: itemResults
            });
        });
    });
};

// ===========================================================
// ADMIN: UPDATE ORDER STATUS
// ===========================================================

export const adminUpdateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded"
    ];

    if (!allowedStatuses.includes(status))
        return res.status(400).json({ message: "Invalid status" });

    const sql = "UPDATE orders SET order_status = ? WHERE id = ?";

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Order not found" });

        // If cancelled, restore stock
        if (status === "cancelled") {
            const sqlItems =
                "SELECT product_id, quantity FROM order_items WHERE order_id = ?";

            db.query(sqlItems, [id], (err2, items) => {
                if (err2) {
                    console.error("DB error:", err2);
                    return; // continue without interrupting response
                }

                items.forEach((item) => {
                    db.query(
                        "UPDATE products SET stock = stock + ? WHERE id = ?",
                        [item.quantity, item.product_id]
                    );
                });
            });
        }

        if (status === "paid") {
            sendOrderEmailToCustomer(id);
        }

        res.json({ message: "Order status updated" });
    });
};

// ===========================================================
// ADMIN: BULK CSV PRODUCTS IMPORT
// ===========================================================
export const bulkImportProducts = (req, res) => {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Invalid payload: expected an array of products" });
    }

    // Fetch existing category IDs to validate foreign key constraints
    db.query("SELECT id FROM categories", (catErr, catRows) => {
        if (catErr) {
            console.error("Error fetching categories for bulk import:", catErr);
            return res.status(500).json({ message: "Database error during category validation: " + catErr.message });
        }

        const validCategoryIds = new Set(catRows.map(row => row.id));

        const sql = `
            INSERT INTO products (id, name, description, price, stock, category_id, image_url, is_visible)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                price = VALUES(price),
                stock = VALUES(stock),
                category_id = VALUES(category_id),
                image_url = VALUES(image_url),
                is_visible = VALUES(is_visible)
        `;

        const values = products.map(p => {
            const rawCatId = p.category_id ? Number(p.category_id) : null;
            // If the category ID is specified but doesn't exist, default to null to avoid foreign key failure
            const safeCatId = (rawCatId !== null && validCategoryIds.has(rawCatId)) ? rawCatId : null;

            return [
                p.id ? Number(p.id) : null,
                p.name,
                p.description || null,
                p.price ? Number(p.price) : 0,
                p.stock ? Number(p.stock) : 0,
                safeCatId,
                p.image_url || null,
                p.is_visible !== undefined && p.is_visible !== null ? (String(p.is_visible).toLowerCase() === "true" || p.is_visible === 1 || p.is_visible === true) : true
            ];
        });

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error("Bulk product import error:", err);
                return res.status(500).json({ message: "Database error during bulk product import: " + err.message });
            }
            res.json({ message: `${result.affectedRows} products imported/updated successfully` });
        });
    });
};

// ===========================================================
// ADMIN: BULK CSV ORDERS IMPORT
// ===========================================================
export const bulkImportOrders = (req, res) => {
    const orders = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ message: "Invalid payload: expected an array of orders" });
    }

    const sql = `
        INSERT INTO orders (id, user_id, total, payment_method, order_status)
        VALUES ?
        ON DUPLICATE KEY UPDATE
            user_id = VALUES(user_id),
            total = VALUES(total),
            payment_method = VALUES(payment_method),
            order_status = VALUES(order_status)
    `;

    const values = orders.map(o => [
        o.id ? Number(o.id) : null,
        o.user_id ? Number(o.user_id) : null,
        o.total ? Number(o.total) : 0,
        o.payment_method || "Razorpay",
        o.order_status || "pending"
    ]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Bulk order import error:", err);
            return res.status(500).json({ message: "Database error during bulk order import: " + err.message });
        }
        res.json({ message: `${result.affectedRows} orders imported/updated successfully` });
    });
};

