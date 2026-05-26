import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/imageController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// ======================================================
// MULTER CONFIGURATION (Memory Storage for S3)
// ======================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ======================================================
// IMAGE UPLOAD (ADMIN ONLY)
// ======================================================
router.post(
  "/upload",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  uploadImage
);

export default router;
