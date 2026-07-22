import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  initiateDirectSaleOrder,
  confirmDirectSaleOrder,
  cancelDirectSaleOrder,
  placeDirectSaleOrder
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

// Admin: Initiate direct store sale order (Phase 1)
router.post("/direct-sale/initiate", verifyToken, verifyAdmin, initiateDirectSaleOrder);

// Admin: Place direct store sale order (Single-Phase unified flow)
router.post("/direct-sale/place", verifyToken, verifyAdmin, placeDirectSaleOrder);

// Admin: Confirm direct store sale order (Phase 2)
router.put("/direct-sale/:id/confirm", verifyToken, verifyAdmin, confirmDirectSaleOrder);

// Admin: Cancel direct store sale order (Phase 2 Alternative)
router.put("/direct-sale/:id/cancel", verifyToken, verifyAdmin, cancelDirectSaleOrder);

// Admin: Get all orders
router.get("/", verifyToken, verifyAdmin, adminGetOrders);

// Admin: Update order status
router.put("/:id/status", verifyToken, verifyAdmin, adminUpdateOrderStatus);

export default router;
