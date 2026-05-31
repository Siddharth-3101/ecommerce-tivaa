import db from "../config/db.js";

// ===========================================================
// CATEGORY MANAGEMENT
// ===========================================================

// Add Category
export const addCategory = (req, res) => {
    const { name, description, image_url } = req.body;

    if (!name)
        return res.status(400).json({ message: "Category name required" });

    const sql = "INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)";

    db.query(sql, [name, description || null, image_url || null], (err) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }
        res.json({ message: "Category added" });
    });
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
};

// Update Category
export const updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const sql =
        "UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?";

    db.query(sql, [name, description, image_url || null, id], (err, result) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Category not found" });

        res.json({ message: "Category updated" });
    });
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

        res.json({ message: "Order status updated" });
    });
};
