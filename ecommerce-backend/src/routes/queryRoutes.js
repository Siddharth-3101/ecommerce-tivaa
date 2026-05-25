import express from "express";
import { submitQuery, adminGetQueries, adminReplyQuery } from "../controllers/queryController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public: Submit query
router.post("/", submitQuery);

// Admin: Get all queries
router.get("/admin", verifyToken, verifyAdmin, adminGetQueries);

// Admin: Reply to query
router.post("/admin/:id/reply", verifyToken, verifyAdmin, adminReplyQuery);

export default router;
