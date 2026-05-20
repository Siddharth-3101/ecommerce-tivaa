import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart
} from "../controllers/cartController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ======================================================
// CART ROUTES (User Only)
// ======================================================

// Add an item to cart
router.post("/", verifyToken, addToCart);

// Get all cart items for logged-in user
router.get("/", verifyToken, getCart);

// Update quantity of a specific cart item
router.put("/:id", verifyToken, updateCartItem);

// Remove a specific item from cart
router.delete("/:id", verifyToken, removeFromCart);

// Clear entire cart
router.delete("/", verifyToken, clearCart);

export default router;
