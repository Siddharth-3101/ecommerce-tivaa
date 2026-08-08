import express from "express";
import {
  registerUser,
  verifyRegister,
  loginUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  updateProfile,
  requestAccountDeletion
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

// Verify OTP and complete registration
router.post("/verify-register", verifyRegister);

// Login existing user
router.post("/login", loginUser);

// Forgot Password request link
router.post("/forgot-password", forgotPassword);

// Reset Password confirmation
router.post("/reset-password", resetPassword);

// Update user profile details
router.put("/profile", verifyToken, updateProfile);

// Request Account Deletion (DPDP)
router.post("/profile/delete-request", verifyToken, requestAccountDeletion);

// Get logged-in user details (profile)
router.get("/me", verifyToken, currentUser);

export default router;
