import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./src/routes/index.js";
import db from "./src/config/db.js";
import mysql from "mysql2";
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

// Global Cache prevention for all JSON API endpoints to ensure CDN/Amplify updates are instant
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

// =======================================================
// DATABASE AUTO-CREATION & AUTO-MIGRATIONS
// =======================================================
import { runSetup } from "./setup.js";

const ensureDatabaseAndRunMigrations = async () => {
  try {
    console.log("Checking if RDS database exists...");
    const tempConnection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });

    await new Promise((resolve, reject) => {
      tempConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "ecommerce"}\``,
        (err) => {
          tempConnection.end();
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log(`✅ Database "${process.env.DB_NAME || "ecommerce"}" verified/created successfully`);

    // Now check pool connection and run migrations
    db.getConnection(async (poolErr, connection) => {
      if (poolErr) {
        console.error("❌ MySQL Connection Failed after auto-creation:", poolErr);
      } else {
        console.log("✅ MySQL Connected Successfully to database");
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
  } catch (err) {
    console.error("❌ Database auto-creation/initialization failed:", err);
  }
};

ensureDatabaseAndRunMigrations();

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
    db.query("DESCRIBE orders", (describeErr, describeRows) => {
      if (describeErr) {
        return res.json({
          message: "E-commerce API is running, database connected, but failed to describe orders.",
          error: describeErr.message
        });
      }

      db.query("SELECT * FROM orders ORDER BY id DESC LIMIT 5", (selectErr, selectRows) => {
        const sampleOrders = selectErr ? [] : selectRows;
        
        db.query("SHOW TABLES", (err2, tables) => {
          if (err2) {
            return res.json({
              message: "E-commerce API is running, database connected, but failed to retrieve tables.",
              database_connected: true,
              error_message: err2.message,
              orders_schema: describeRows,
              sample_orders: sampleOrders
            });
          }

          const tableNames = tables.map(row => Object.values(row)[0]);
          return res.json({
            message: "E-commerce API is running and successfully connected to the database!",
            database_connected: true,
            database_name: process.env.DB_NAME || "unknown",
            tables: tableNames,
            orders_schema: describeRows,
            sample_orders: sampleOrders
          });
        });
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
