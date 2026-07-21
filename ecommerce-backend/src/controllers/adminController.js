import db from "../config/db.js";
import { sendOrderEmailToCustomer } from "../utils/orderEmail.js";

// ===========================================================
// CATEGORY MANAGEMENT
// ===========================================================

// Add Category
export const addCategory = (req, res) => {
    const { name, description, image_url, parent_id, show_in_homepage, hsn_id } = req.body;

    if (!name)
        return res.status(400).json({ message: "Category name required" });

    const targetParentId = parent_id ? Number(parent_id) : null;
    const targetHsnId = hsn_id ? Number(hsn_id) : null;

    const performInsert = () => {
        const sql = "INSERT INTO categories (name, description, image_url, parent_id, show_in_homepage, hsn_id) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(sql, [name, description || null, image_url || null, targetParentId, show_in_homepage ? 1 : 0, targetHsnId], (err) => {
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
    const { name, description, image_url, parent_id, show_in_homepage, hsn_id } = req.body;

    const targetParentId = parent_id ? Number(parent_id) : null;
    const targetHsnId = hsn_id ? Number(hsn_id) : null;

    if (targetParentId && targetParentId === Number(id)) {
        return res.status(400).json({ message: "A category cannot be its own parent." });
    }

    const performUpdate = () => {
        const sql =
            "UPDATE categories SET name = ?, description = ?, image_url = ?, parent_id = ?, show_in_homepage = ?, hsn_id = ? WHERE id = ?";

        db.query(sql, [name, description, image_url || null, targetParentId, show_in_homepage ? 1 : 0, targetHsnId, id], (err, result) => {
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
// ADMIN: VIEW ALL ORDERS (EXCLUDING SOFT-DELETED)
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
            pay.payment_reference AS payment_id,
            o.order_type,
            COALESCE(o.is_deleted, 0) AS is_deleted
        FROM orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN payments pay ON pay.order_id = o.id
        WHERE (o.is_deleted = 0 OR o.is_deleted IS NULL)
        ORDER BY o.id DESC
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
// ADMIN: VIEW ALL ORDERS FOR SOFT-DELETE MANAGEMENT (INCLUDES DELETED)
// ===========================================================

export const adminGetManageOrders = (req, res) => {
    const sql = `
        SELECT 
            o.id,
            o.invoice_number,
            o.user_id,
            COALESCE(u.name, 'Store Customer') AS customer,
            COALESCE(u.email, 'N/A') AS email,
            o.total,
            o.order_status,
            o.payment_method,
            o.created_at,
            o.razorpay_order_id,
            pay.payment_reference AS payment_id,
            o.order_type,
            COALESCE(o.is_deleted, 0) AS is_deleted,
            o.deleted_at
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN payments pay ON pay.order_id = o.id
        ORDER BY o.id DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("DB error fetching manage orders:", err);
            return res.status(500).json({ message: "DB error", error: err.message });
        }
        res.json(rows);
    });
};

// ===========================================================
// ADMIN: SOFT DELETE ORDER
// ===========================================================

export const adminSoftDeleteOrder = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE orders SET is_deleted = 1, deleted_at = NOW() WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error soft deleting order:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order soft deleted successfully" });
    });
};

// ===========================================================
// ADMIN: RESTORE SOFT-DELETED ORDER
// ===========================================================

export const adminRestoreOrder = (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE orders SET is_deleted = 0, deleted_at = NULL WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error restoring order:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order restored successfully" });
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
            oi.price,
            oi.selected_variation,
            COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN hsn_codes h ON c.hsn_id = h.id
        LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
        LEFT JOIN hsn_codes ph ON parent_c.hsn_id = ph.id
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
            INSERT INTO products (id, name, description, price, stock, category_id, image_url, is_visible, purchase_price, discounted_price, purchased_from)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                price = VALUES(price),
                stock = VALUES(stock),
                category_id = VALUES(category_id),
                image_url = VALUES(image_url),
                is_visible = VALUES(is_visible),
                purchase_price = VALUES(purchase_price),
                discounted_price = VALUES(discounted_price),
                purchased_from = VALUES(purchased_from)
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
                p.is_visible !== undefined && p.is_visible !== null ? (String(p.is_visible).toLowerCase() === "true" || String(p.is_visible) === "1" || p.is_visible === 1 || p.is_visible === true) : true,
                p.purchase_price !== undefined && p.purchase_price !== null && p.purchase_price !== "" ? Number(p.purchase_price) : null,
                p.discounted_price !== undefined && p.discounted_price !== null && p.discounted_price !== "" ? Number(p.discounted_price) : null,
                p.purchased_from || null
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

// ===========================================================
// ADMIN: SEARCH CUSTOMER BY EMAIL OR PHONE
// ===========================================================
export const searchCustomer = (req, res) => {
    const { email, phone } = req.query;

    if (!email && !phone) {
        return res.status(400).json({ message: "Email or phone query parameter required" });
    }

    let sql = "SELECT name, email, phone FROM users WHERE 1=0";
    const params = [];
    if (email) {
        sql += " OR email = ?";
        params.push(email.trim());
    }
    if (phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        sql += " OR REPLACE(REPLACE(phone, '+91', ''), ' ', '') = ?";
        params.push(cleanPhone);
    }

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("DB error searching customer:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (rows && rows.length > 0) {
            return res.json({ found: true, customer: rows[0] });
        } else {
            return res.json({ found: false });
        }
    });
};

// ===========================================================
// ADMIN: HSN CODE MANAGEMENT (MASTERS)
// ===========================================================

export const getHsnCodes = (req, res) => {
    db.query("SELECT * FROM hsn_codes ORDER BY id DESC", (err, rows) => {
        if (err) {
            console.error("DB error fetching HSN codes:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
    });
};

export const createHsnCode = (req, res) => {
    const { hsn_code, hsn_name, tax_percentage } = req.body;

    if (!hsn_code || !hsn_name || tax_percentage === undefined || tax_percentage === null) {
        return res.status(400).json({ message: "HSN Code, HSN Name, and Tax Percentage are required" });
    }

    const sql = "INSERT INTO hsn_codes (hsn_code, hsn_name, tax_percentage) VALUES (?, ?, ?)";
    db.query(sql, [hsn_code.trim(), hsn_name.trim(), parseFloat(tax_percentage)], (err, result) => {
        if (err) {
            console.error("DB error creating HSN code:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "HSN code created successfully", id: result.insertId });
    });
};

export const updateHsnCode = (req, res) => {
    const { id } = req.params;
    const { hsn_code, hsn_name, tax_percentage } = req.body;

    if (!hsn_code || !hsn_name || tax_percentage === undefined || tax_percentage === null) {
        return res.status(400).json({ message: "HSN Code, HSN Name, and Tax Percentage are required" });
    }

    const sql = "UPDATE hsn_codes SET hsn_code = ?, hsn_name = ?, tax_percentage = ? WHERE id = ?";
    db.query(sql, [hsn_code.trim(), hsn_name.trim(), parseFloat(tax_percentage), id], (err, result) => {
        if (err) {
            console.error("DB error updating HSN code:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "HSN code not found" });
        }
        res.json({ message: "HSN code updated successfully" });
    });
};

export const deleteHsnCode = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM hsn_codes WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error deleting HSN code:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "HSN code not found" });
        }
        res.json({ message: "HSN code deleted successfully" });
    });
};

// ===========================================================
// ADMIN: GST STATE MANAGEMENT (MASTERS)
// ===========================================================

const createGstStateTableIfMissing = (callback) => {
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS gst_states (
            id INT AUTO_INCREMENT PRIMARY KEY,
            state_code VARCHAR(50) NOT NULL,
            state_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.query(createTableSql, callback);
};

export const getGstStates = (req, res) => {
    db.query("SELECT * FROM gst_states ORDER BY id DESC", (err, rows) => {
        if (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                return createGstStateTableIfMissing((cErr) => {
                    if (cErr) return res.status(500).json({ message: "Database error: " + cErr.message });
                    return res.json([]);
                });
            }
            console.error("DB error fetching GST states:", err);
            return res.status(500).json({ message: "Database error: " + err.message });
        }
        res.json(rows || []);
    });
};

export const createGstState = (req, res) => {
    const { state_code, state_name, code, name } = req.body;
    const codeStr = String(state_code ?? code ?? "").trim();
    const nameStr = String(state_name ?? name ?? "").trim();

    if (!codeStr || !nameStr) {
        return res.status(400).json({ message: "State Code and GST State name are required" });
    }

    const insertSql = "INSERT INTO gst_states (state_code, state_name) VALUES (?, ?)";
    db.query(insertSql, [codeStr, nameStr], (err, result) => {
        if (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                return createGstStateTableIfMissing((cErr) => {
                    if (cErr) return res.status(500).json({ message: "Database error: " + cErr.message });
                    db.query(insertSql, [codeStr, nameStr], (err2, result2) => {
                        if (err2) return res.status(500).json({ message: "Database error: " + err2.message });
                        return res.json({ message: "GST State created successfully", id: result2.insertId });
                    });
                });
            }
            console.error("DB error creating GST state:", err);
            return res.status(500).json({ message: "Database error: " + err.message });
        }
        res.json({ message: "GST State created successfully", id: result.insertId });
    });
};

export const updateGstState = (req, res) => {
    const { id } = req.params;
    const { state_code, state_name, code, name } = req.body;
    const codeStr = String(state_code ?? code ?? "").trim();
    const nameStr = String(state_name ?? name ?? "").trim();

    if (!codeStr || !nameStr) {
        return res.status(400).json({ message: "State Code and GST State name are required" });
    }

    const sql = "UPDATE gst_states SET state_code = ?, state_name = ? WHERE id = ?";
    db.query(sql, [codeStr, nameStr, id], (err, result) => {
        if (err) {
            console.error("DB error updating GST state:", err);
            return res.status(500).json({ message: "Database error: " + err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "GST State not found" });
        }
        res.json({ message: "GST State updated successfully" });
    });
};

export const deleteGstState = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM gst_states WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error deleting GST state:", err);
            return res.status(500).json({ message: "Database error: " + err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "GST State not found" });
        }
        res.json({ message: "GST State deleted successfully" });
    });
};

