import express from "express";
import { getAdminStats } from "../controllers/statsController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAdminStats);

export default router;
