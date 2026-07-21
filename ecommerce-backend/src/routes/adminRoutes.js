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
  searchCustomer,
  getHsnCodes,
  createHsnCode,
  updateHsnCode,
  deleteHsnCode,
} from "../controllers/adminController.js";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  bulkDeleteProducts,
  resetProductAutoIncrement,
  resequenceProductIds,
  resetAllProducts,
  checkDatabaseIntegrity,
} from "../controllers/productController.js";

import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// ======================================================
// CUSTOMER SEARCH (ADMIN ONLY)
// ======================================================
router.get("/customers/search", verifyToken, verifyAdmin, searchCustomer);

// ======================================================
// PRODUCT MANAGEMENT (ADMIN ONLY)
// ======================================================
router.post("/product", verifyToken, verifyAdmin, addProduct);
router.put("/product/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/product/:id", verifyToken, verifyAdmin, deleteProduct);
router.post("/products/bulk-delete", verifyToken, verifyAdmin, bulkDeleteProducts);
router.post("/products/reset-auto-increment", verifyToken, verifyAdmin, resetProductAutoIncrement);
router.post("/products/resequence-ids", verifyToken, verifyAdmin, resequenceProductIds);
router.post("/products/reset-all", verifyToken, verifyAdmin, resetAllProducts);
router.get("/db/check-integrity", verifyToken, verifyAdmin, checkDatabaseIntegrity);
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

// ======================================================
// HSN CODE MASTERS (ADMIN ONLY)
// ======================================================
router.get("/hsn", verifyToken, verifyAdmin, getHsnCodes);
router.post("/hsn", verifyToken, verifyAdmin, createHsnCode);
router.put("/hsn/:id", verifyToken, verifyAdmin, updateHsnCode);
router.delete("/hsn/:id", verifyToken, verifyAdmin, deleteHsnCode);

export default router;
