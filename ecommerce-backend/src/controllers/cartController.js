import db from "../config/db.js";

// ===========================================================
// ADD TO CART
// ===========================================================
export const addToCart = (req, res) => {
  const userId = req.user.id;
  let { product_id, quantity, selected_variation } = req.body;

  quantity = Number(quantity);

  if (!product_id || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  // Check if product exists
  const checkProduct = "SELECT * FROM products WHERE id = ?";
  db.query(checkProduct, [product_id], (err, productRows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Dynamic grouping: check if product_id + selected_variation already in cart
    const checkCart = "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (selected_variation = ? OR (selected_variation IS NULL AND ? IS NULL))";
    db.query(checkCart, [userId, product_id, selected_variation || null, selected_variation || null], (errCart, cartRows) => {
      if (errCart) {
        console.error("DB error:", errCart);
        return res.status(500).json({ message: "Database error" });
      }

      const product = productRows[0];
      const stockVal = product.stock === null || product.stock === undefined ? 0 : Number(product.stock);

      if (cartRows.length > 0) {
        const newQty = Number(cartRows[0].quantity) + quantity;
        if (newQty > stockVal) {
          return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
        }
        // Increment quantity of existing row
        const updateQty = "UPDATE cart SET quantity = quantity + ? WHERE id = ?";
        db.query(updateQty, [quantity, cartRows[0].id], (errUpdate) => {
          if (errUpdate) {
            console.error("DB error:", errUpdate);
            return res.status(500).json({ message: "Database error" });
          }
          return res.json({ message: "Item quantity updated in cart" });
        });
      } else {
        if (quantity > stockVal) {
          return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
        }
        // Insert new variation row
        const insertRow = "INSERT INTO cart (user_id, product_id, quantity, selected_variation) VALUES (?, ?, ?, ?)";
        db.query(insertRow, [userId, product_id, quantity, selected_variation || null], (errInsert) => {
          if (errInsert) {
            console.error("DB error:", errInsert);
            return res.status(500).json({ message: "Database error" });
          }
          return res.json({ message: "Item added to cart" });
        });
      }
    });
  });
};

// ===========================================================
// GET CART ITEMS
// ===========================================================
export const getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      c.id,
      c.product_id,
      p.name,
      p.price,
      p.image_url,
      c.quantity,
      c.selected_variation,
      p.stock,
      (p.price * c.quantity) AS total
    FROM cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(rows);
  });
};

// ===========================================================
// UPDATE CART QUANTITY
// ===========================================================
export const updateCartItem = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  let { quantity } = req.body;

  quantity = Number(quantity);

  if (quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const checkStockSql = `
    SELECT c.quantity AS cart_qty, p.stock 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.id = ? AND c.user_id = ?
  `;
  db.query(checkStockSql, [id, userId], (errStock, stockRows) => {
    if (errStock) {
      console.error("DB error:", errStock);
      return res.status(500).json({ message: "Database error" });
    }
    if (stockRows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const { stock } = stockRows[0];
    const stockVal = stock === null || stock === undefined ? 0 : Number(stock);
    if (quantity > stockVal) {
      return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
    }

    const sql = `
      UPDATE cart
      SET quantity = ?
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [quantity, id, userId], (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      return res.json({ message: "Quantity updated" });
    });
  });
};

// ===========================================================
// REMOVE A SINGLE CART ITEM
// ===========================================================
export const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";

  db.query(sql, [id, userId], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.json({ message: "Item removed" });
  });
};

// ===========================================================
// CLEAR CART (Used After Order Placement)
// ===========================================================
export const clearCart = (req, res) => {
  const userId = req.user.id;

  const sql = "DELETE FROM cart WHERE user_id = ?";

  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json({ message: "Cart cleared" });
  });
};
