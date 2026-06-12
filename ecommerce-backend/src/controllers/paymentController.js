import Razorpay from "razorpay";
import crypto from "crypto";
import db from "../config/db.js";
import dotenv from "dotenv";
import { sendOrderEmailToAdmins, sendOrderEmailToCustomer } from "../utils/orderEmail.js";
dotenv.config();

// ==========================================================
// RAZORPAY INSTANCE
// ==========================================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// ==========================================================
// STEP 1 — CREATE RAZORPAY ORDER
// ==========================================================
export const createPaymentOrder = (req, res) => {
  const { amount, currency = "INR", order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  // Create Razorpay order
  const options = {
    amount: amount * 100, // convert to paise
    currency,
    receipt: "rcpt_" + Date.now(),
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.error("❌ Razorpay Order Error:", err);
      return res
        .status(500)
        .json({ message: "Failed to create Razorpay order" });
    }

    // Update DB with Razorpay order_id
    db.query(
      "UPDATE orders SET razorpay_order_id = ? WHERE id = ?",
      [order.id, order_id],
      (err2) => {
        if (err2) {
          console.error("❌ DB Error (Save Razorpay Order ID):", err2);
        }
      }
    );

    return res.json({
      ...order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  });
};

// ==========================================================
// STEP 2 — VERIFY PAYMENT SIGNATURE
// ==========================================================
export const verifyPayment = (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment parameters" });
  }

  // Validate signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  // Fetch order total
  db.query(
    "SELECT total FROM orders WHERE id = ?",
    [order_id],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Order not found" });
      }

      const amount = rows[0].total;

      // Save payment record
      db.query(
        `INSERT INTO payments 
         (order_id, provider, amount, status, payment_reference)
         VALUES (?, 'razorpay', ?, 'success', ?)`,
        [order_id, amount, razorpay_payment_id],
        (err2) => {
          if (err2) {
            console.error("❌ Payment Save Error:", err2);
          }
        }
      );

      // Mark order as paid
      db.query(
        "UPDATE orders SET order_status = 'paid' WHERE id = ?",
        [order_id],
        (err3) => {
          if (err3) {
            console.error("❌ Order Update Error:", err3);
          } else {
            sendOrderEmailToAdmins(order_id);
            sendOrderEmailToCustomer(order_id);
          }
        }
      );

      return res.json({ message: "Payment verified successfully" });
    }
  );
};

// ==========================================================
// STEP 3 — RAZORPAY WEBHOOK (Recommended for production)
// ==========================================================
export const razorpayWebhook = (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  console.log("🔔 Razorpay Webhook Event:", event);

  // Payment Captured Event
  if (event === "payment.captured") {
    const paymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;

    // Update payments table
    db.query(
      "UPDATE payments SET status='success' WHERE payment_reference = ?",
      [paymentId],
      (err) => {
        if (err) {
          console.error("❌ Webhook Payment Update Error:", err);
        }
      }
    );

    // Mark order as paid and trigger emails
    db.query(
      "SELECT id FROM orders WHERE razorpay_order_id = ?",
      [razorpayOrderId],
      (errSelect, rows) => {
        if (!errSelect && rows.length > 0) {
          const orderId = rows[0].id;
          db.query(
            "UPDATE orders SET order_status='paid' WHERE id = ?",
            [orderId],
            (err) => {
              if (err) {
                console.error("❌ Webhook Order Update Error:", err);
              } else {
                sendOrderEmailToAdmins(orderId);
                sendOrderEmailToCustomer(orderId);
              }
            }
          );
        } else {
          // Fallback to update using razorpay_order_id directly if select failed
          db.query(
            "UPDATE orders SET order_status='paid' WHERE razorpay_order_id = ?",
            [razorpayOrderId],
            (err) => {
              if (err) console.error("❌ Webhook Order Update Fallback Error:", err);
            }
          );
        }
      }
    );
  }

  return res.json({ status: "ok" });
};

// ==========================================================
// STEP 4 — INITIATE REFUND (API Endpoint)
// ==========================================================
export const refundPayment = (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" });
  }

  // 1. Fetch payment_reference from payments table
  db.query(
    "SELECT payment_reference, amount FROM payments WHERE order_id = ? AND status = 'success'",
    [order_id],
    (err, payments) => {
      if (err || payments.length === 0) {
        console.error("❌ Payment record not found for refund:", err);
        return res.status(404).json({ message: "No successful payment found for this order" });
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
          [refund.id, order_id],
          (errUpdate) => {
            if (errUpdate) console.error("❌ DB Payment Refund Status Update Error:", errUpdate);
          }
        );

        // 4. Update order status to 'refunded'
        db.query(
          "UPDATE orders SET order_status = 'refunded' WHERE id = ?",
          [order_id],
          (errUpdateOrder) => {
            if (errUpdateOrder) console.error("❌ DB Order Refund Status Update Error:", errUpdateOrder);
          }
        );

        return res.json({ message: "Refund processed successfully", refundId: refund.id });
      });
    }
  );
};

