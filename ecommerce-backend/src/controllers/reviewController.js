import db from "../config/db.js";

// ===========================================================
// ADD REVIEW
// ===========================================================
export const addReview = (req, res) => {
  const userId = req.user.id;
  const { product_id, rating, review } = req.body;

  if (!product_id || !rating) {
    return res
      .status(400)
      .json({ message: "product_id and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // Prevent duplicate reviews per product per user
  const checkSql =
    "SELECT id FROM reviews WHERE user_id = ? AND product_id = ?";

  db.query(checkSql, [userId, product_id], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Insert review
    const sql = `
            INSERT INTO reviews (user_id, product_id, rating, review)
            VALUES (?, ?, ?, ?)
        `;

    db.query(sql, [userId, product_id, rating, review || null], (err2) => {
      if (err2) {
        console.error("DB Error:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "Review added successfully" });
    });
  });
};

// ===========================================================
// UPDATE REVIEW
// ===========================================================
export const updateReview = (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id;
  const { rating, review } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // Ensure review belongs to user
  const checkSql = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";

  db.query(checkSql, [reviewId, userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    const sql = `
            UPDATE reviews 
            SET rating = ?, review = ?
            WHERE id = ?
        `;

    db.query(
      sql,
      [
        rating || rows[0].rating,
        review || rows[0].review,
        reviewId,
      ],
      (err2) => {
        if (err2) {
          console.error("DB Error:", err2);
          return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Review updated successfully" });
      }
    );
  });
};

// ===========================================================
// DELETE REVIEW
// ===========================================================
export const deleteReview = (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id;

  const sql = "DELETE FROM reviews WHERE id = ? AND user_id = ?";

  db.query(sql, [reviewId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    return res.json({ message: "Review deleted successfully" });
  });
};

// ===========================================================
// GET REVIEWS FOR A PRODUCT
// ===========================================================
export const getProductReviews = (req, res) => {
  const { product_id } = req.params;

  const sql = `
        SELECT 
            r.id,
            r.rating,
            r.review,
            r.created_at,
            u.name AS user_name
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    `;

  db.query(sql, [product_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    return res.json(rows);
  });
};

// ===========================================================
// GET AVERAGE RATING FOR PRODUCT
// ===========================================================
export const getAverageRating = (req, res) => {
  const { product_id } = req.params;

  const sql = `SELECT AVG(rating) AS avg_rating FROM reviews WHERE product_id = ?`;

  db.query(sql, [product_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    return res.json({
      product_id,
      average_rating: Number(rows[0].avg_rating || 0).toFixed(1),
    });
  });
};
