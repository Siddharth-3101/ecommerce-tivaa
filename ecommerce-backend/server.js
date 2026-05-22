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
// DATABASE CONNECTION CHECK & AUTO MIGRATIONS
// =======================================================
import { runSetup } from "./setup.js";

db.getConnection(async (err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
    if (connection) connection.release();
    
    try {
      console.log("Running automatic database migrations/setup...");
      await runSetup();
      console.log("✅ Database migration/setup completed successfully");
    } catch (setupErr) {
      console.error("❌ Automatic Database Setup Failed:", setupErr);
    }
  }
});

// Initialize caching
initCache();

// =======================================================
// API ROUTES
// =======================================================
app.use("/api", routes);

// =======================================================
// HEALTH CHECK ROUTE (WITH RDS DATABASE DIAGNOSTICS)
// =======================================================
app.get("/", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("❌ Database health check failed:", err);
      return res.status(500).json({
        message: "E-commerce API is running, but database connection is FAILING!",
        database_connected: false,
        error_code: err.code,
        error_message: err.message,
        db_config: {
          host: process.env.DB_HOST || "not set",
          user: process.env.DB_USER || "not set",
          database: process.env.DB_NAME || "not set",
          port: process.env.DB_PORT || 3306
        }
      });
    }

    // Connection is healthy, query tables to see if they exist
    db.query("SHOW TABLES", (err2, tables) => {
      if (err2) {
        return res.json({
          message: "E-commerce API is running, database connected, but failed to retrieve tables.",
          database_connected: true,
          error_message: err2.message
        });
      }

      const tableNames = tables.map(row => Object.values(row)[0]);
      return res.json({
        message: "E-commerce API is running and successfully connected to the database!",
        database_connected: true,
        database_name: process.env.DB_NAME || "unknown",
        tables: tableNames
      });
    });
  });
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
