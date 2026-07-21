import express from "express";

import {
  addCategory,
  deleteCategory,
  updateCategory,
  adminGetOrders,
  adminOrderDetails,
  adminUpdateOrderStatus,
  adminGetManageOrders,
  adminSoftDeleteOrder,
  adminRestoreOrder,
  bulkImportProducts,
  bulkImportOrders,
  searchCustomer,
  getHsnCodes,
  createHsnCode,
  updateHsnCode,
  deleteHsnCode,
  getGstStates,
  createGstState,
  updateGstState,
  deleteGstState,
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
router.get("/orders-manage", verifyToken, verifyAdmin, adminGetManageOrders);
router.get("/orders/:id", verifyToken, verifyAdmin, adminOrderDetails);
router.put("/orders/:id/status", verifyToken, verifyAdmin, adminUpdateOrderStatus);
router.put("/orders/:id/soft-delete", verifyToken, verifyAdmin, adminSoftDeleteOrder);
router.put("/orders/:id/restore", verifyToken, verifyAdmin, adminRestoreOrder);
router.post("/orders/bulk", verifyToken, verifyAdmin, bulkImportOrders);

// ======================================================
// HSN CODE MASTERS (ADMIN ONLY)
// ======================================================
router.get("/hsn", verifyToken, verifyAdmin, getHsnCodes);
router.post("/hsn", verifyToken, verifyAdmin, createHsnCode);
router.put("/hsn/:id", verifyToken, verifyAdmin, updateHsnCode);
router.delete("/hsn/:id", verifyToken, verifyAdmin, deleteHsnCode);

import {
  downloadGstReadyReport,
  downloadOrderReport
} from "../controllers/reportController.js";

// ======================================================
// GST STATE MASTERS (ADMIN ONLY)
// ======================================================
router.get("/gst-states", verifyToken, verifyAdmin, getGstStates);
router.post("/gst-states", verifyToken, verifyAdmin, createGstState);
router.put("/gst-states/:id", verifyToken, verifyAdmin, updateGstState);
router.delete("/gst-states/:id", verifyToken, verifyAdmin, deleteGstState);

// ======================================================
// REPORTS & EXCEL EXPORTS (ADMIN ONLY)
// ======================================================
router.get("/reports/gst-ready", verifyToken, verifyAdmin, downloadGstReadyReport);
router.get("/reports/orders", verifyToken, verifyAdmin, downloadOrderReport);

export default router;
