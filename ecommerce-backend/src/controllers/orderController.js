import db from "../config/db.js";
import Razorpay from "razorpay";
import { sendOrderEmailToAdmins, sendOrderEmailToCustomer } from "../utils/orderEmail.js";
import { getEffectiveProductPriceAndStock } from "./cartController.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =============================================================
// CREATE ORDER
// =============================================================
export const createOrder = (req, res) => {
  const userId = req.user.id;
  const { payment_method, shipping_address, city, state, state_code, gst_state, pincode, phone, buy_now } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: "Payment method required" });
  }

  // Fetch shipping cost from settings table
  db.query("SELECT value FROM settings WHERE `key` = 'shipping_cost'", (errSettings, settingsRows) => {
    let shippingCost = 0.00;
    if (!errSettings && settingsRows && settingsRows.length > 0) {
      shippingCost = parseFloat(settingsRows[0].value) || 0.00;
    }

    const processOrderWithItems = (cartItems) => {
      // Step 2 — Check stock availability
      for (const item of cartItems) {
        const stockVal = item.stock === null || item.stock === undefined ? 0 : Number(item.stock);
        if (item.quantity > stockVal) {
          return res.status(400).json({
            message: `Not enough stock for ${item.name}`,
          });
        }
      }

      // Step 3 — Calculate total amount including shipping cost
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const total = subtotal + shippingCost;

      // Step 4 — Create main order with shipping_cost column
      const sqlCreateOrder = `
              INSERT INTO orders (user_id, total, shipping_cost, payment_method, order_status)
              VALUES (?, ?, ?, ?, 'pending')
          `;

      db.query(sqlCreateOrder, [userId, total, shippingCost, payment_method], (err2, result) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ message: "Database error" });
        }

        const orderId = result.insertId;
        const now = new Date();
        const yy = String(now.getFullYear()).substring(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const seq = String(orderId).padStart(3, '0');
        const invoiceNumber = `#TV${yy}${mm}${dd}${seq}`;

        db.query("UPDATE orders SET invoice_number = ? WHERE id = ?", [invoiceNumber, orderId]);

        // Step 5 — Fetch Business State setting and insert order items with tax snapshot
        db.query("SELECT `value` FROM settings WHERE `key` = 'business_state'", (errSettings, sRows) => {
          const bizState = (sRows && sRows.length > 0 && sRows[0].value) ? sRows[0].value.trim() : "Tamil Nadu";
          const cleanBizState = bizState.toLowerCase().replace(/[^a-z0-9]/g, "");
          const cleanSaleState = (state || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
          const isSameState = cleanSaleState === "" || cleanSaleState === cleanBizState;
          const itemGstState = (state && state.trim()) ? state.trim() : bizState;

          const itemsSql = `
            INSERT INTO order_items (
              order_id, product_id, quantity, price, selected_variation,
              gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, gst_state_name
            ) VALUES ?
          `;

          const values = cartItems.map((item) => {
            const qty = Number(item.quantity || 1);
            const unitPrice = Number(item.price || 0);
            const lineTotal = unitPrice * qty;
            const gstRate = Number(item.gst_percentage || 0);
            
            const taxableAmount = gstRate > 0 ? Number(((lineTotal * 100) / (100 + gstRate)).toFixed(2)) : lineTotal;
            const totalTax = Number((lineTotal - taxableAmount).toFixed(2));
            
            let cgst = 0.00;
            let sgst = 0.00;
            let igst = 0.00;

            if (isSameState) {
              cgst = Number((totalTax / 2).toFixed(2));
              sgst = Number((totalTax / 2).toFixed(2));
            } else {
              igst = totalTax;
            }

            return [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              item.selected_variation || null,
              gstRate,
              taxableAmount,
              cgst,
              sgst,
              igst,
              itemGstState
            ];
          });

          db.query(itemsSql, [values], (err3) => {
            if (err3) {
              console.error("DB error inserting order items with tax snapshot:", err3);
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
                      (order_id, address, city, state, state_code, gst_state, pincode, phone)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `;

          db.query(
            sqlShip,
            [orderId, shipping_address, city, state, state_code || null, gst_state || null, pincode, phone || null],
            (err4) => {
              if (err4) console.warn("Shipping insert error:", err4);
            }
          );

          // Step 7.5 — Auto-save shipping address to user's account profile
          db.query(
            "UPDATE users SET address = ?, city = ?, state = ?, pincode = ?, phone = ? WHERE id = ?",
            [shipping_address, city, state, pincode, phone || null, userId],
            (errUserUpdate) => {
              if (errUserUpdate) console.warn("Auto-save address error:", errUserUpdate);
            }
          );

          // Step 8 — Clear user's cart (or just the buy now product if buy_now is active)
          if (buy_now) {
            db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, buy_now.product_id], (err5) => {
              if (err5) console.warn("Cart item clear error:", err5);
            });
          } else {
            db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err5) => {
              if (err5) console.warn("Cart clear error:", err5);
            });
          }

          if (payment_method === 'cod') {
            sendOrderEmailToAdmins(orderId);
            sendOrderEmailToCustomer(orderId);
          }

          return res.json({
            message: "Order created successfully",
            orderId,
            total,
          });
        });
      });
    });
  };

    if (buy_now) {
      // Fetch single product details for buy now
      db.query(
        `SELECT 
            p.id, 
            p.price, 
            p.stock, 
            p.name, 
            p.variations, 
            p.discounted_price,
            COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
         FROM products p
         LEFT JOIN categories cat ON cat.id = p.category_id
         LEFT JOIN hsn_codes h ON h.id = cat.hsn_id
         LEFT JOIN categories pc ON pc.id = cat.parent_id
         LEFT JOIN hsn_codes ph ON ph.id = pc.hsn_id
         WHERE p.id = ?`,
        [buy_now.product_id],
        (errProd, prodRows) => {
          if (errProd) {
            console.error("DB error fetching product for buy now:", errProd);
            return res.status(500).json({ message: "Database error" });
          }
          if (prodRows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
          }
          const product = prodRows[0];
          const { price: effectivePrice, stock: effectiveStock } = getEffectiveProductPriceAndStock(product, buy_now.selected_variation);
          const singleItem = {
            product_id: product.id,
            quantity: Number(buy_now.quantity) || 1,
            price: effectivePrice,
            stock: effectiveStock,
            name: product.name,
            selected_variation: buy_now.selected_variation || null,
            gst_percentage: product.gst_percentage || 0
          };
          processOrderWithItems([singleItem]);
        }
      );
    } else {
      // Step 1 — Fetch cart items with category HSN GST percentage
      const sqlCart = `
            SELECT 
                c.product_id, 
                c.quantity, 
                p.price, 
                p.stock, 
                p.name,
                c.selected_variation,
                p.variations,
                p.discounted_price,
                COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
            FROM cart c
            JOIN products p ON p.id = c.product_id
            LEFT JOIN categories cat ON cat.id = p.category_id
            LEFT JOIN hsn_codes h ON h.id = cat.hsn_id
            LEFT JOIN categories pc ON pc.id = cat.parent_id
            LEFT JOIN hsn_codes ph ON ph.id = pc.hsn_id
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

        // Apply overrides to items in checkout
        const overriddenItems = cartItems.map(item => {
          const { price: effectivePrice, stock: effectiveStock } = getEffectiveProductPriceAndStock(item, item.selected_variation);
          return {
            ...item,
            price: effectivePrice,
            stock: effectiveStock
          };
        });

        processOrderWithItems(overriddenItems);
      });
    }
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
        WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
        ORDER BY id DESC
    `;

  db.query(sql, [userId], (err, orders) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (orders.length === 0) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.json([]);
    }

    const orderIds = orders.map(o => o.id);
    const sqlItems = `
      SELECT 
        oi.*, 
        p.name, 
        p.image_url, 
        p.variations,
        COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN hsn_codes h ON c.hsn_id = h.id
      LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
      LEFT JOIN hsn_codes ph ON parent_c.hsn_id = ph.id
      WHERE oi.order_id IN (${orderIds.map(() => "?").join(",")})
    `;

    db.query(sqlItems, orderIds, (errItems, items) => {
      if (errItems) {
        console.error("DB error fetching order items:", errItems);
        return res.status(500).json({ message: "Database error" });
      }

      const formattedItems = items.map(item => {
        let imageUrl = item.image_url;
        if (item.variations && item.selected_variation) {
          try {
            const parsedGroups = typeof item.variations === 'string' ? JSON.parse(item.variations) : item.variations;
            if (Array.isArray(parsedGroups)) {
              const selections = item.selected_variation.split(",").reduce((acc, part) => {
                const splitIdx = part.indexOf(":");
                if (splitIdx > -1) {
                  acc[part.substring(0, splitIdx).trim().toLowerCase()] = part.substring(splitIdx + 1).trim().toLowerCase();
                }
                return acc;
              }, {});

              for (const group of parsedGroups) {
                if (group.options && Array.isArray(group.options)) {
                  const groupName = (group.name || "").trim().toLowerCase();
                  const selectedVal = selections[groupName];
                  if (selectedVal) {
                    const matchedOpt = group.options.find(opt => (opt.value || "").trim().toLowerCase() === selectedVal);
                    if (matchedOpt && matchedOpt.image_url) {
                      imageUrl = matchedOpt.image_url;
                      break;
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error parsing variations in getUserOrders:", e);
          }
        }
        return {
          ...item,
          image_url: imageUrl
        };
      });

      const itemsByOrderId = {};
      formattedItems.forEach(item => {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push(item);
      });

      const ordersWithItems = orders.map(order => ({
        ...order,
        items: itemsByOrderId[order.id] || []
      }));

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.json(ordersWithItems);
    });
  });
};

// =============================================================
// GET ORDER DETAILS (with items)
// =============================================================
export const getOrderDetails = (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  const sqlOrder = `
        SELECT o.*, u.name AS customer_name, u.email AS customer_email, 
               s.address, s.city, s.state, s.pincode, s.phone,
               p.payment_reference, p.status AS payment_status
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN shipping_details s ON o.id = s.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = ? AND o.user_id = ?
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
                p.image_url,
                p.variations,
                COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN hsn_codes h ON c.hsn_id = h.id
            LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
            LEFT JOIN hsn_codes ph ON parent_c.hsn_id = ph.id
            WHERE oi.order_id = ?
        `;

    db.query(sqlItems, [orderId], (err2, items) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      const formattedItems = items.map(item => {
        let imageUrl = item.image_url;
        if (item.variations && item.selected_variation) {
          try {
            const parsedGroups = typeof item.variations === 'string' ? JSON.parse(item.variations) : item.variations;
            if (Array.isArray(parsedGroups)) {
              const selections = item.selected_variation.split(",").reduce((acc, part) => {
                const splitIdx = part.indexOf(":");
                if (splitIdx > -1) {
                  acc[part.substring(0, splitIdx).trim().toLowerCase()] = part.substring(splitIdx + 1).trim().toLowerCase();
                }
                return acc;
              }, {});

              for (const group of parsedGroups) {
                const groupKey = group.name.trim().toLowerCase();
                const selectedVal = selections[groupKey];
                if (selectedVal && group.options) {
                  const matchedOption = group.options.find(opt => opt.value.trim().toLowerCase() === selectedVal);
                  if (matchedOption && matchedOption.image_url && matchedOption.image_url.trim()) {
                    imageUrl = matchedOption.image_url.trim() + (item.image_url ? "," + item.image_url : "");
                    break;
                  }
                }
              }
            }
          } catch (e) {
            console.error("Failed to parse variations for order items image resolution", e);
          }
        }
        return {
          ...item,
          image_url: imageUrl
        };
      });

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.json({
        order: orders[0],
        items: formattedItems,
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

    const status = rows[0].order_status;

    if (status !== "pending" && status !== "paid") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled now (only pending or paid orders can be cancelled)" });
    }

    // Helper function to restore stock
    const restoreStock = () => {
      const sqlItems = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
      db.query(sqlItems, [orderId], (err3, items) => {
        if (err3) {
          console.error("DB error (restore stock):", err3);
          return;
        }
        items.forEach((i) => {
          db.query(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [i.quantity, i.product_id]
          );
        });
      });
    };

    if (status === "paid") {
      // 1. Fetch payment_reference from payments table
      db.query(
        "SELECT payment_reference, amount FROM payments WHERE order_id = ? AND status = 'success'",
        [orderId],
        (errPay, payments) => {
          if (errPay || payments.length === 0) {
            console.error("❌ Payment record not found for refund:", errPay);
            return res.status(404).json({ message: "No successful payment found for this paid order" });
          }

          const { payment_reference: paymentId, amount } = payments[0];

          // 2. Call Razorpay refund API
          razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) }, (errRefund, refund) => {
            if (errRefund) {
              console.error("❌ Razorpay Refund Error:", errRefund);
              return res.status(500).json({ message: "Failed to initiate refund with Razorpay" });
            }

            // 3. Update payment status to 'refunded'
            db.query(
              "UPDATE payments SET status = 'refunded', payment_reference = ? WHERE order_id = ?",
              [refund.id, orderId]
            );

            // 4. Update order status to 'refunded'
            db.query(
              "UPDATE orders SET order_status = 'refunded' WHERE id = ?",
              [orderId],
              (err2) => {
                if (err2) {
                  console.error("DB error:", err2);
                  return res.status(500).json({ message: "Database error" });
                }

                // 5. Restore product stock
                restoreStock();
                return res.json({ message: "Order cancelled and payment refunded successfully", refundId: refund.id });
              }
            );
          });
        }
      );
    } else {
      // Standard pending cancellation (no payment made)
      db.query(
        "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
        [orderId],
        (err2) => {
          if (err2) {
            console.error("DB error:", err2);
            return res.status(500).json({ message: "Database error" });
          }

          // Restore product stock
          restoreStock();
          return res.json({ message: "Order cancelled successfully" });
        }
      );
    }
  });
};

// ===========================================================
// ADMIN: INITIATE DIRECT STORE SALE (Phase 1: Create Pending Order)
// ===========================================================
export const initiateDirectSaleOrder = (req, res) => {
  const adminId = req.user.id;

  // 1. Fetch admin's cart items with category HSN GST percentage
  const sqlCart = `
    SELECT 
        c.product_id, 
        c.quantity, 
        p.price, 
        p.stock, 
        p.name,
        c.selected_variation,
        p.variations,
        p.discounted_price,
        COALESCE(h.tax_percentage, ph.tax_percentage, 0) AS gst_percentage
    FROM cart c
    JOIN products p ON p.id = c.product_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN hsn_codes h ON h.id = cat.hsn_id
    LEFT JOIN categories pc ON pc.id = cat.parent_id
    LEFT JOIN hsn_codes ph ON ph.id = pc.hsn_id
    WHERE c.user_id = ?
  `;

  db.query(sqlCart, [adminId], (err, cartItems) => {
    if (err) {
      console.error("DB error fetching admin cart:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Admin's cart is empty" });
    }

    // Apply overrides to items in checkout (no shipping cost for store sales)
    const overriddenItems = cartItems.map(item => {
      const { price: effectivePrice, stock: effectiveStock } = getEffectiveProductPriceAndStock(item, item.selected_variation);
      return {
        ...item,
        price: effectivePrice,
        stock: effectiveStock
      };
    });

    // Check stock availability (using effective variant stock)
    for (const item of overriddenItems) {
      const stockVal = item.stock === null || item.stock === undefined ? 0 : Number(item.stock);
      if (item.quantity > stockVal) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    const subtotal = overriddenItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0.00;
    const total = subtotal;

    // Helper function to insert order with default store guest
    const insertPendingOrder = (defaultUserId) => {
      const sqlCreateOrder = `
        INSERT INTO orders (user_id, total, shipping_cost, payment_method, order_status, order_type)
        VALUES (?, ?, ?, 'UPI', 'pending', 'Store')
      `;

      db.query(sqlCreateOrder, [defaultUserId, total, shippingCost], (errCreate, result) => {
        if (errCreate) {
          console.error("Error creating store sale order:", errCreate);
          return res.status(500).json({ message: "Database error" });
        }

        const orderId = result.insertId;
        const now = new Date();
        const yy = String(now.getFullYear()).substring(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const seq = String(orderId).padStart(3, '0');
        const invoiceNumber = `#TV${yy}${mm}${dd}${seq}`;

        db.query("UPDATE orders SET invoice_number = ? WHERE id = ?", [invoiceNumber, orderId]);

        // Fetch Business State setting (default Tamil Nadu) and insert order items with tax snapshot
        db.query("SELECT `value` FROM settings WHERE `key` = 'business_state'", (errSettings, sRows) => {
          const bizState = (sRows && sRows.length > 0 && sRows[0].value) ? sRows[0].value.trim() : "Tamil Nadu";

          const itemsSql = `
            INSERT INTO order_items (
              order_id, product_id, quantity, price, selected_variation,
              gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, gst_state_name
            ) VALUES ?
          `;

          const values = overriddenItems.map((item) => {
            const qty = Number(item.quantity || 1);
            const unitPrice = Number(item.price || 0);
            const lineTotal = unitPrice * qty;
            const gstRate = Number(item.gst_percentage || 0);
            
            const taxableAmount = gstRate > 0 ? Number(((lineTotal * 100) / (100 + gstRate)).toFixed(2)) : lineTotal;
            const totalTax = Number((lineTotal - taxableAmount).toFixed(2));
            const cgst = Number((totalTax / 2).toFixed(2));
            const sgst = Number((totalTax / 2).toFixed(2));
            const igst = 0.00;

            return [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              item.selected_variation || null,
              gstRate,
              taxableAmount,
              cgst,
              sgst,
              igst,
              bizState
            ];
          });

          db.query(itemsSql, [values], (errItems) => {
            if (errItems) {
              console.error("Error inserting store order items:", errItems);
              return res.status(500).json({ message: "Database error" });
            }

            // Reduce product stock values
            overriddenItems.forEach((item) => {
              db.query(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.product_id]
              );
            });

            // Insert shipping details
            const sqlShip = `
              INSERT INTO shipping_details (order_id, address, city, state, pincode, phone)
              VALUES (?, 'Direct Store Sale', 'Store', ?, '000000', NULL)
            `;
            db.query(sqlShip, [orderId, bizState], (errShip) => {
              if (errShip) console.warn("Store shipping insert error:", errShip);
            });

          // Clear admin's cart
          db.query("DELETE FROM cart WHERE user_id = ?", [adminId], (errClear) => {
            if (errClear) console.warn("Admin cart clear error:", errClear);
          });

          // Format dynamic Order Number
          const now = new Date();
          const yy = String(now.getFullYear()).substring(2);
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const dd = String(now.getDate()).padStart(2, '0');
          const seq = String(orderId).padStart(3, '0');
          const orderNumber = `#TV${yy}${mm}${dd}${seq}`;

          return res.json({
            message: "Direct store sale initiated successfully",
            orderId,
            total,
            orderNumber,
            orderDate: now.toISOString()
          });
        });
      });
    });
  };

    // Find or create default guest user 'guest-store-sale@tivaa.in'
    const defaultEmail = "guest-store-sale@tivaa.in";
    db.query("SELECT id FROM users WHERE email = ?", [defaultEmail], (errDefault, defaultUserRows) => {
      if (errDefault) {
        console.error("Error searching for default store guest user:", errDefault);
        return res.status(500).json({ message: "Database error" });
      }

      if (defaultUserRows && defaultUserRows.length > 0) {
        insertPendingOrder(defaultUserRows[0].id);
      } else {
        // Create the default store sale guest user
        const defaultName = "Store Guest";
        const dummyPassword = "store-guest-dummy-password";
        db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
          [defaultName, defaultEmail, dummyPassword],
          (errCreateDefault, createDefaultResult) => {
            if (errCreateDefault) {
              console.error("Error creating default guest user:", errCreateDefault);
              return res.status(500).json({ message: "Database error" });
            }
            insertPendingOrder(createDefaultResult.insertId);
          }
        );
      }
    });
  });
};

// ===========================================================
// ADMIN: CONFIRM DIRECT STORE SALE (Phase 2: Finalize Customer Info & Paid Status)
// ===========================================================
export const confirmDirectSaleOrder = (req, res) => {
  const orderId = req.params.id;
  const { payment_method, customer_name, customer_email, customer_phone, notes } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: "Payment method required" });
  }

  const hasName = customer_name && String(customer_name).trim().length > 0;
  const hasEmail = customer_email && String(customer_email).trim().length > 0;
  const hasPhone = customer_phone && String(customer_phone).trim().length > 0;

  if (!hasName && !hasEmail && !hasPhone) {
    return res.status(400).json({ message: "Please enter at least one customer detail (Full Name, Email Address, or Mobile Number) to confirm the order." });
  }

  // Find or create the customer user
  const resolveCustomerAndConfirm = (customerId) => {
    // 1. Update order fields (status to 'paid', user_id to customerId, payment_method)
    const sqlUpdateOrder = `
      UPDATE orders 
      SET user_id = ?, payment_method = ?, order_status = 'paid' 
      WHERE id = ? AND order_type = 'Store'
    `;

    db.query(sqlUpdateOrder, [customerId, payment_method, orderId], (errUpdate, result) => {
      if (errUpdate) {
        console.error("Error updating direct sale order status:", errUpdate);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found or not a Store sale" });
      }

      // 2. Insert/update shipping details with Business State, customer phone, and admin notes
      db.query("SELECT `value` FROM settings WHERE `key` = 'business_state'", (errSettings, sRows) => {
        const bizState = (sRows && sRows.length > 0 && sRows[0].value) ? sRows[0].value.trim() : "Tamil Nadu";
        db.query("SELECT state_code, gst_state, state_name FROM gst_states WHERE LOWER(state_name) = LOWER(?) LIMIT 1", [bizState], (errGst, gstRows) => {
          const sCode = (gstRows && gstRows.length > 0 && gstRows[0].state_code) ? gstRows[0].state_code : "33";
          const gState = (gstRows && gstRows.length > 0 && gstRows[0].gst_state) ? gstRows[0].gst_state : "33-Tamil Nadu";
          const sName = (gstRows && gstRows.length > 0 && gstRows[0].state_name) ? gstRows[0].state_name : bizState;

          const sqlUpdateShip = `
            INSERT INTO shipping_details (order_id, address, city, state, state_code, gst_state, pincode, phone)
            VALUES (?, ?, 'Store', ?, ?, ?, '000000', ?)
            ON DUPLICATE KEY UPDATE 
              address = VALUES(address),
              state = VALUES(state),
              state_code = VALUES(state_code),
              gst_state = VALUES(gst_state),
              phone = VALUES(phone)
          `;
          db.query(sqlUpdateShip, [orderId, notes || "Direct Store Sale", sName, sCode, gState, customer_phone || null], (errShip) => {
            if (errShip) console.warn("Error updating direct sale shipping details:", errShip);
          });
        });
      });

      // Send email to customer (if email is provided)
      if (customer_email && !customer_email.includes("guest-")) {
        sendOrderEmailToCustomer(orderId);
      }

      return res.json({ message: "Order confirmed and completed successfully" });
    });
  };

  // If email or phone is provided, check if user exists
  if (customer_email || customer_phone) {
    let checkSql = "SELECT id FROM users WHERE 1=0";
    const checkParams = [];
    if (customer_email) {
      checkSql += " OR email = ?";
      checkParams.push(customer_email.trim());
    }
    if (customer_phone) {
      checkSql += " OR phone = ?";
      checkParams.push(customer_phone.trim());
    }

    db.query(checkSql, checkParams, (errSearch, userRows) => {
      if (errSearch) {
        console.error("Error checking customer existence:", errSearch);
        return res.status(500).json({ message: "Database error" });
      }

      if (userRows && userRows.length > 0) {
        resolveCustomerAndConfirm(userRows[0].id);
      } else {
        // Create guest user profile
        const safeEmail = customer_email ? customer_email.trim() : `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}@tivaa.in`;
        const safePhone = customer_phone ? customer_phone.trim() : null;
        const safeName = customer_name ? customer_name.trim() : "Store Customer";
        const dummyPassword = Math.random().toString(36).substring(2);

        db.query(
          "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')",
          [safeName, safeEmail, dummyPassword, safePhone],
          (errCreateUser, createUserResult) => {
            if (errCreateUser) {
              console.error("Error creating guest user:", errCreateUser);
              return res.status(500).json({ message: "Database error creating user" });
            }
            resolveCustomerAndConfirm(createUserResult.insertId);
          }
        );
      }
    });
  } else {
    // Keep it linked to default store guest user (already set during initiate)
    db.query("SELECT user_id FROM orders WHERE id = ?", [orderId], (errFind, rows) => {
      if (errFind || rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      resolveCustomerAndConfirm(rows[0].user_id);
    });
  }
};

// ===========================================================
// ADMIN: CANCEL DIRECT STORE SALE (Phase 2 Alternative: Cancel Order & Restore Stock)
// ===========================================================
export const cancelDirectSaleOrder = (req, res) => {
  const orderId = req.params.id;

  // 1. Fetch order items to restore stock
  const sqlItems = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
  db.query(sqlItems, [orderId], (errItems, items) => {
    if (errItems) {
      console.error("Error fetching order items for cancel:", errItems);
      return res.status(500).json({ message: "Database error" });
    }

    // 2. Set order status to cancelled
    db.query("UPDATE orders SET order_status = 'cancelled' WHERE id = ? AND order_type = 'Store'", [orderId], (errCancel, result) => {
      if (errCancel) {
        console.error("Error cancelling order:", errCancel);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found or not a Store sale" });
      }

      // 3. Restore product stock values
      items.forEach((item) => {
        db.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      });

      return res.json({ message: "Order cancelled and stock restored successfully" });
    });
  });
};
