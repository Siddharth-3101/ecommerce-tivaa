import db from "../config/db.js";

// =============================================================
// ADMIN: CREATE COUPON
// =============================================================
export const createCoupon = (req, res) => {
  const { code, type, value, min_bill_amount, start_date, end_date } = req.body;

  if (!code || !type) {
    return res.status(400).json({ message: "Code and type are required" });
  }

  const cleanCode = code.trim().toUpperCase();
  if (type !== "percentage" && type !== "flat_amount" && type !== "free_shipping") {
    return res.status(400).json({ message: "Invalid coupon type" });
  }

  // Get server's local today date string
  const todayStr = new Date().toISOString().split('T')[0];

  if (start_date && start_date < todayStr) {
    return res.status(400).json({ message: "Start date cannot be in the past" });
  }

  if (end_date) {
    if (end_date < todayStr) {
      return res.status(400).json({ message: "End date cannot be in the past" });
    }
    const cmpStart = start_date || todayStr;
    if (end_date < cmpStart) {
      return res.status(400).json({ message: "End date cannot be before the start date" });
    }
  }

  const numericValue = (type === "percentage" || type === "flat_amount") ? parseFloat(value) || 0 : 0;
  const minBill = parseFloat(min_bill_amount) || 0;
  const start = start_date ? new Date(`${start_date} 00:00:00`) : new Date(`${todayStr} 00:00:00`);
  const end = end_date ? new Date(`${end_date} 23:59:59`) : null;

  const insertSql = `
    INSERT INTO coupons (code, type, value, min_bill_amount, start_date, end_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, true)
  `;

  db.query(insertSql, [cleanCode, type, numericValue, minBill, start, end], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      console.error("Error creating coupon:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(201).json({
      message: "Coupon created successfully",
      couponId: result.insertId
    });
  });
};

// =============================================================
// ADMIN: LIST ALL COUPONS
// =============================================================
export const listCoupons = (req, res) => {
  const selectSql = "SELECT * FROM coupons ORDER BY id DESC";

  db.query(selectSql, (err, rows) => {
    if (err) {
      console.error("Error listing coupons:", err);
      return res.status(500).json({ message: "Database error" });
    }
    return res.json(rows);
  });
};

// =============================================================
// ADMIN: DELETE COUPON
// =============================================================
export const deleteCoupon = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM coupons WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting coupon:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    return res.json({ message: "Coupon deleted successfully" });
  });
};

// =============================================================
// ADMIN: TOGGLE ACTIVE STATUS
// =============================================================
export const toggleCouponActive = (req, res) => {
  const { id } = req.params;

  db.query("SELECT is_active FROM coupons WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error toggling coupon status:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const currentStatus = rows[0].is_active;
    const newStatus = currentStatus ? 0 : 1;

    db.query("UPDATE coupons SET is_active = ? WHERE id = ?", [newStatus, id], (errUpdate) => {
      if (errUpdate) {
        console.error("Error updating coupon status:", errUpdate);
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({
        message: `Coupon status updated successfully`,
        is_active: !!newStatus
      });
    });
  });
};

// =============================================================
// CUSTOMER: VALIDATE COUPON
// =============================================================
export const validateCoupon = (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  const cleanCode = code.trim().toUpperCase();
  const currentSubtotal = parseFloat(subtotal) || 0;
  const now = new Date();

  const selectSql = "SELECT * FROM coupons WHERE code = ?";

  db.query(selectSql, [cleanCode], (err, rows) => {
    if (err) {
      console.error("Error validating coupon:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    const coupon = rows[0];

    // Check active status
    if (!coupon.is_active) {
      return res.status(400).json({ message: "This coupon is currently inactive" });
    }

    // Check start date (must be in past or current)
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return res.status(400).json({ message: "This coupon is not active yet" });
    }

    // Check expiration date
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    // Check minimum order amount
    if (currentSubtotal < parseFloat(coupon.min_bill_amount)) {
      return res.status(400).json({
        message: `Minimum bill amount of ₹${parseFloat(coupon.min_bill_amount).toFixed(2)} is required for this coupon`
      });
    }

    // Calculate discount amount
    let discountAmount = 0.00;
    if (coupon.type === "percentage") {
      discountAmount = parseFloat(((currentSubtotal * parseFloat(coupon.value)) / 100).toFixed(2));
    } else if (coupon.type === "flat_amount") {
      discountAmount = parseFloat(coupon.value);
    }

    // Cap discount at subtotal
    if (discountAmount > currentSubtotal) {
      discountAmount = currentSubtotal;
    }

    return res.json({
      message: "Coupon validated successfully",
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount_amount: discountAmount,
        min_bill_amount: coupon.min_bill_amount
      }
    });
  });
};
