import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook
} from "../controllers/paymentController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ======================================================
// PAYMENT ROUTES (USER)
// ======================================================

// Step 1: User creates Razorpay order
router.post("/order", verifyToken, createPaymentOrder);

// Step 2: Verify Razorpay payment signature after checkout
router.post("/verify", verifyToken, verifyPayment);

// ======================================================
// RAZORPAY WEBHOOK (NO AUTH - Razorpay must access it)
// IMPORTANT: MUST USE express.raw()
// ======================================================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
