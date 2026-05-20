import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts
} from "../controllers/productController.js";

import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// ======================================================
// PUBLIC: SEARCH & FILTER
// ======================================================
router.get("/search", searchProducts);     // /products/search?q=...
router.get("/filter", filterProducts);     // /products/filter?category=...

// ======================================================
// PUBLIC: PRODUCT LIST + PAGINATION
// ======================================================
router.get("/", getProducts);              // /products?page=1&limit=10

// ======================================================
// PUBLIC: SINGLE PRODUCT DETAILS
// ======================================================
router.get("/:id", getProductById);

// ======================================================
// ADMIN: MANAGE PRODUCTS
// ======================================================
router.post("/", verifyToken, verifyAdmin, addProduct);
router.put("/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;
