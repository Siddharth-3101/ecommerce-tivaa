import db from "../config/db.js";

// ===========================================================
// GET ALL CATEGORIES (PUBLIC)
// ===========================================================

export const getCategories = (req, res) => {
    const sql = `
        SELECT 
            c.*, 
            h.hsn_code, 
            h.hsn_name, 
            h.tax_percentage 
        FROM categories c 
        LEFT JOIN hsn_codes h ON h.id = c.hsn_id 
        ORDER BY c.id ASC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }
        res.json(rows);
    });
};

export const getCategoryById = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            c.*, 
            h.hsn_code, 
            h.hsn_name, 
            h.tax_percentage 
        FROM categories c 
        LEFT JOIN hsn_codes h ON h.id = c.hsn_id 
        WHERE c.id = ?
    `;

    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "DB error" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(rows[0]);
    });
};
