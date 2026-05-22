import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth
} from "../controllers/authController.js";

import {
  verifyToken,
  currentUser
} from "../middleware/auth.js";

const router = express.Router();

// ======================================================
// AUTH ROUTES
// ======================================================

// Google Sign-In / Register
router.post("/google", googleAuth);

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get logged-in user details (profile)
router.get("/me", verifyToken, currentUser);

export default router;
