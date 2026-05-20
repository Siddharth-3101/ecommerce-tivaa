import express from "express";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getAverageRating
} from "../controllers/reviewController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ======================================================
// USER: ADD REVIEW
// ======================================================
router.post("/", verifyToken, addReview);

// ======================================================
// USER: UPDATE THEIR REVIEW
// ======================================================
router.put("/:id", verifyToken, updateReview);

// ======================================================
// USER: DELETE THEIR REVIEW
// ======================================================
router.delete("/:id", verifyToken, deleteReview);

// ======================================================
// PUBLIC: GET ALL REVIEWS FOR A PRODUCT
// ======================================================
router.get("/product/:product_id", getProductReviews);

// ======================================================
// PUBLIC: GET AVERAGE RATING FOR PRODUCT
// ======================================================
router.get("/product/:product_id/average", getAverageRating);

export default router;
