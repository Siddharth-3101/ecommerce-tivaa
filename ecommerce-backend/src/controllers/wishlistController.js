import db from "../config/db.js";

export const getWishlist = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT w.id as wishlist_id, p.*, c.name AS category_name
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ? AND p.is_active = true
    `;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        return res.json(rows);
    });
};

export const addToWishlist = (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ message: "productId required" });

    db.query("INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)", [userId, productId], (err, _) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        return res.json({ message: "Added to wishlist" });
    });
};

export const removeFromWishlist = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // product_id

    db.query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [userId, id], (err, _) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        return res.json({ message: "Removed from wishlist" });
    });
};
