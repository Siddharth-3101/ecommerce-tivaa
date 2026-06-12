import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// Publicly get all settings (e.g. banners)
router.get("/", getSettings);

// Admin-only update settings
router.put("/", verifyToken, verifyAdmin, updateSettings);

export default router;
