import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
    .get(verifyToken, getWishlist)
    .post(verifyToken, addToWishlist);

router.route("/:id")
    .delete(verifyToken, removeFromWishlist);

export default router;
