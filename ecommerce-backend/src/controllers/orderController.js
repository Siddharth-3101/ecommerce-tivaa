import db from "../config/db.js";

// =============================================================
// CREATE ORDER
// =============================================================
export const createOrder = (req, res) => {
  const userId = req.user.id;
  const { payment_method, shipping_address, city, state, pincode } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: "Payment method required" });
  }

  // Step 1 — Fetch cart items
  const sqlCart = `
        SELECT 
            c.product_id, 
            c.quantity, 
            p.price, 
            p.stock, 
            p.name
        FROM cart c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = ?
    `;

  db.query(sqlCart, [userId], (err, cartItems) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Step 2 — Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.name}`,
        });
      }
    }

    // Step 3 — Calculate total amount
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Step 4 — Create main order
    const sqlCreateOrder = `
            INSERT INTO orders (user_id, total, payment_method, order_status)
            VALUES (?, ?, ?, 'pending')
        `;

    db.query(sqlCreateOrder, [userId, total, payment_method], (err2, result) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      const orderId = result.insertId;

      // Step 5 — Insert order items
      const itemsSql = `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ?
            `;

      const values = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      db.query(itemsSql, [values], (err3) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ message: "Database error" });
        }

        // Step 6 — Reduce stock
        cartItems.forEach((item) => {
          db.query(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            [item.quantity, item.product_id]
          );
        });

        // Step 7 — Add shipping details
        const sqlShip = `
                    INSERT INTO shipping_details 
                    (order_id, address, city, state, pincode)
                    VALUES (?, ?, ?, ?, ?)
                `;

        db.query(
          sqlShip,
          [orderId, shipping_address, city, state, pincode],
          (err4) => {
            if (err4) console.warn("Shipping insert error:", err4);
          }
        );

        // Step 8 — Clear user's cart
        db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err5) => {
          if (err5) console.warn("Cart clear error:", err5);
        });

        return res.json({
          message: "Order created successfully",
          orderId,
          total,
        });
      });
    });
  });
};

// =============================================================
// GET USER ORDERS
// =============================================================
export const getUserOrders = (req, res) => {
  const userId = req.user.id;

  const sql = `
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(rows);
  });
};

// =============================================================
// GET ORDER DETAILS (with items)
// =============================================================
export const getOrderDetails = (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  const sqlOrder = `
        SELECT *
        FROM orders
        WHERE id = ? AND user_id = ?
    `;

  db.query(sqlOrder, [orderId, userId], (err, orders) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const sqlItems = `
            SELECT 
                oi.*, 
                p.name, 
                p.image_url
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        `;

    db.query(sqlItems, [orderId], (err2, items) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      return res.json({
        order: orders[0],
        items,
      });
    });
  });
};

// =============================================================
// CANCEL ORDER
// =============================================================
export const cancelOrder = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const sqlCheck = `
        SELECT order_status 
        FROM orders
        WHERE id = ? AND user_id = ?
    `;

  db.query(sqlCheck, [orderId, userId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (rows[0].order_status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled now" });
    }

    // Step 1 — Update order status
    db.query(
      "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
      [orderId],
      (err2) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ message: "Database error" });
        }
      }
    );

    // Step 2 — Restore stock
    const sqlItems =
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?";

    db.query(sqlItems, [orderId], (err3, items) => {
      if (err3) {
        console.error("DB error:", err3);
        return;
      }

      items.forEach((i) => {
        db.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [i.quantity, i.product_id]
        );
      });
    });

    return res.json({ message: "Order cancelled successfully" });
  });
};
