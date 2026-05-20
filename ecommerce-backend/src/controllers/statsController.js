import db from "../config/db.js";

// ================================
// ADMIN ANALYTICS CONTROLLER
// ================================

export const getAdminStats = (req, res) => {

    // SALES (SUM of total per day)
    const sqlSales = `
        SELECT 
            DATE(created_at) AS date,
            SUM(total) AS amount
        FROM orders
        WHERE order_status IN ('paid', 'shipped', 'delivered')
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    `;

    // ORDERS PER DAY
    const sqlOrders = `
        SELECT 
            DATE(created_at) AS date,
            COUNT(*) AS count
        FROM orders
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    `;

    // STOCK LEVELS
    const sqlStock = `
        SELECT 
            name, 
            stock 
        FROM products
        ORDER BY stock ASC
    `;

    // CATEGORY DISTRIBUTION
    const sqlCategory = `
        SELECT 
            c.name,
            COUNT(p.id) AS count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
    `;

    // Execute all queries parallel
    db.query(sqlSales, (err1, sales) => {
        if (err1) return res.status(500).json({ message: "DB Error (sales)" });

        db.query(sqlOrders, (err2, orders) => {
            if (err2) return res.status(500).json({ message: "DB Error (orders)" });

            db.query(sqlStock, (err3, stock) => {
                if (err3) return res.status(500).json({ message: "DB Error (stock)" });

                db.query(sqlCategory, (err4, category) => {
                    if (err4) return res.status(500).json({ message: "DB Error (category)" });

                    return res.json({
                        sales,
                        orders,
                        stock,
                        category
                    });
                });
            });
        });
    });
};
