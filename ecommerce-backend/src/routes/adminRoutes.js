import express from "express";

import {
  addCategory,
  deleteCategory,
  updateCategory,
  adminGetOrders,
  adminOrderDetails,
  adminUpdateOrderStatus,
  bulkImportProducts,
  bulkImportOrders,
} from "../controllers/adminController.js";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  bulkDeleteProducts,
  resetProductAutoIncrement,
  resequenceProductIds,
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
router.post("/products/bulk-delete", verifyToken, verifyAdmin, bulkDeleteProducts);
router.post("/products/reset-auto-increment", verifyToken, verifyAdmin, resetProductAutoIncrement);
router.post("/products/resequence-ids", verifyToken, verifyAdmin, resequenceProductIds);
router.put("/product/:id/toggle-visibility", verifyToken, verifyAdmin, toggleProductVisibility);
router.post("/products/bulk", verifyToken, verifyAdmin, bulkImportProducts);

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
router.post("/orders/bulk", verifyToken, verifyAdmin, bulkImportOrders);


export default router;
