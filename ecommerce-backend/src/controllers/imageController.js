import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ===========================================================
// Configure Cloudinary
// ===========================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dft1i2ozo",
  api_key: process.env.CLOUDINARY_API_KEY || "597131352343776",
  api_secret: process.env.CLOUDINARY_API_SECRET || "0uCnHoCFWbEy1FYrZey5W6ykHW0",
});

// ===========================================================
// UPLOAD IMAGE TO CLOUDINARY
// ===========================================================
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Upload the in-memory buffer to Cloudinary via upload_stream
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "tivaa-products",
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },  // Auto-optimize quality
        { fetch_format: "auto" },  // Auto-convert to WebP where supported
      ],
    },
    (error, result) => {
      if (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        return res.status(500).json({
          message: "Failed to upload image",
          error: error.message,
        });
      }

      return res.json({
        message: "Image uploaded successfully",
        url: result.secure_url,   // HTTPS CDN URL — use this as image_url in DB
        public_id: result.public_id,
      });
    }
  );

  // Pipe the file buffer into the upload stream
  uploadStream.end(req.file.buffer);
};
