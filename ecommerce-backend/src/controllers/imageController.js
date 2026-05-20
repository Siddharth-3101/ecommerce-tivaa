import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// ===========================================================
// Validate AWS ENV variables
// ===========================================================
const requiredEnv = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  }
});

// ===========================================================
// Initialize AWS S3
// ===========================================================
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// ===========================================================
// UPLOAD IMAGE TO S3
// ===========================================================
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = req.file;

  // Generate unique, safe file name
  const fileName = `products/${uuidv4()}-${file.originalname
    .replace(/\s+/g, "_")
    .toLowerCase()}`;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read" // Set to private if you need restricted access
  };

  // Upload to AWS S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error("❌ S3 Upload Error:", err);
      return res.status(500).json({
        message: "Failed to upload image",
        error: err.message
      });
    }

    return res.json({
      message: "Image uploaded successfully",
      url: data.Location,
      key: data.Key
    });
  });
};
