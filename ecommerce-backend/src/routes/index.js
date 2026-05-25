import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import adminRoutes from "./adminRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import imageRoutes from "./imageRoutes.js";
import statsRoutes from "./statsRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import queryRoutes from "./queryRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);
router.use("/upload", imageRoutes);
router.use("/admin/stats", statsRoutes);
router.use("/categories", categoryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/payment", paymentRoutes);
router.use("/queries", queryRoutes);

export default router;
