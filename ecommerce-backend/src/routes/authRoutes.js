import express from "express";
import {
  registerUser,
  loginUser
} from "../controllers/authController.js";

import {
  verifyToken,
  currentUser
} from "../middleware/auth.js";

const router = express.Router();

// ======================================================
// AUTH ROUTES
// ======================================================

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get logged-in user details (profile)
router.get("/me", verifyToken, currentUser);

export default router;
