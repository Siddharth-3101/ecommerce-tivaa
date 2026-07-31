import express from "express";
import {
  createCoupon,
  listCoupons,
  deleteCoupon,
  toggleCouponActive,
  validateCoupon
} from "../controllers/couponController.js";

import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public / Customer validation route
router.post("/validate", verifyToken, validateCoupon);

// Admin Coupon management routes
router.post("/", verifyToken, verifyAdmin, createCoupon);
router.get("/", verifyToken, verifyAdmin, listCoupons);
router.delete("/:id", verifyToken, verifyAdmin, deleteCoupon);
router.put("/:id/toggle", verifyToken, verifyAdmin, toggleCouponActive);

export default router;
