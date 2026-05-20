import db from "../config/db.js";

// ===========================================================
// GET ALL CATEGORIES (PUBLIC)
// ===========================================================

export const getCategories = (req, res) => {
    const sql = "SELECT * FROM categories ORDER BY id ASC";

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
    const sql = "SELECT * FROM categories WHERE id = ?";

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
