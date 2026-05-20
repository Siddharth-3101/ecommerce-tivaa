import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder
} from "../controllers/orderController.js";

import {
  adminGetOrders,
  adminUpdateOrderStatus
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// ======================================================
// USER ORDER ROUTES
// ======================================================

// Create new order
router.post("/", verifyToken, createOrder);

// Get all orders of logged-in user
router.get("/my", verifyToken, getUserOrders);

// Get details of a specific order belonging to user
router.get("/my/:id", verifyToken, getOrderDetails);

// Cancel user's own order
router.put("/my/:id/cancel", verifyToken, cancelOrder);

// ======================================================
// ADMIN ORDER ROUTES
// ======================================================

// Admin: Get all orders
router.get("/", verifyToken, verifyAdmin, adminGetOrders);

// Admin: Update order status
router.put("/:id/status", verifyToken, verifyAdmin, adminUpdateOrderStatus);

export default router;
