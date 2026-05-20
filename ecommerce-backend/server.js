import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes/index.js";
import db from "./src/config/db.js";
import { initCache } from "./src/utils/cache.js";

dotenv.config();

const app = express();

// =======================================================
// RAZORPAY WEBHOOK REQUIRES RAW BODY
// =======================================================
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// =======================================================
// GLOBAL MIDDLEWARE
// =======================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================================================
// DATABASE CONNECTION CHECK
// =======================================================
db.getConnection((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

// Initialize caching
initCache();

// =======================================================
// API ROUTES
// =======================================================
app.use("/api", routes);

// =======================================================
// HEALTH CHECK ROUTE
// =======================================================
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API running..." });
});

// =======================================================
// GLOBAL ERROR HANDLER
// =======================================================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// =======================================================
// START SERVER
// =======================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
