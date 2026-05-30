import express from "express";

import {
  addCategory,
  deleteCategory,
  updateCategory,
  adminGetOrders,
  adminOrderDetails,
  adminUpdateOrderStatus,
} from "../controllers/adminController.js";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} from "../controllers/productController.js";

import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// ======================================================
// PRODUCT MANAGEMENT (ADMIN ONLY)
// ======================================================
router.post("/product", verifyToken, verifyAdmin, addProduct);
router.put("/product/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/product/:id", verifyToken, verifyAdmin, deleteProduct);
router.put("/product/:id/toggle-visibility", verifyToken, verifyAdmin, toggleProductVisibility);

// ======================================================
// CATEGORY MANAGEMENT (ADMIN ONLY)
// ======================================================
router.post("/category", verifyToken, verifyAdmin, addCategory);
router.put("/category/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/category/:id", verifyToken, verifyAdmin, deleteCategory);

// ======================================================
// ORDER MANAGEMENT (ADMIN ONLY)
// ======================================================
router.get("/orders", verifyToken, verifyAdmin, adminGetOrders);
router.get("/orders/:id", verifyToken, verifyAdmin, adminOrderDetails);
router.put("/orders/:id/status", verifyToken, verifyAdmin, adminUpdateOrderStatus);

export default router;
