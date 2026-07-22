import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// Auto-migrate schema on connection to ensure live DB supports large text and multiple images
db.query(`
  ALTER TABLE products 
  MODIFY description LONGTEXT,
  MODIFY image_url LONGTEXT,
  MODIFY variations LONGTEXT,
  MODIFY features LONGTEXT;
`, (err) => {
  if (err) {
    console.error("Auto-migration note (can be ignored if already updated):", err.message);
  } else {
    console.log("Database schema successfully verified/upgraded for large text fields.");
  }
});

// Auto-migrate orders table schema to include processing and refunded statuses
db.query(`
  ALTER TABLE orders 
  MODIFY COLUMN order_status ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending';
`, (err) => {
  if (err) {
    console.error("Auto-migration orders note:", err.message);
  } else {
    console.log("Orders schema successfully updated for extra statuses.");
  }
});

// Auto-migrate settings table
db.query(`
  CREATE TABLE IF NOT EXISTS settings (
    \`key\` VARCHAR(255) PRIMARY KEY,
    \`value\` LONGTEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error("Auto-migration settings note:", err.message);
  } else {
    console.log("Settings table successfully verified/created.");
  }
});

// Auto-migrate orders table schema to include shipping_cost
db.query(`
  ALTER TABLE orders 
  ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00;
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration orders shipping_cost note:", err.message);
    }
  } else {
    console.log("Orders schema successfully updated for shipping_cost.");
  }
});

// Auto-migrate orders table schema to include order_type
db.query(`
  ALTER TABLE orders 
  ADD COLUMN order_type ENUM('Online', 'Store') DEFAULT 'Online';
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration orders order_type note:", err.message);
    }
  } else {
    console.log("Orders schema successfully updated for order_type.");
  }
});

// Auto-migrate orders table schema to include is_deleted and deleted_at
db.query(`ALTER TABLE orders ADD COLUMN is_deleted TINYINT(1) DEFAULT 0;`, (err) => {
  if (err && !err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
    console.error("Auto-migration orders is_deleted note:", err.message);
  }
});

db.query(`ALTER TABLE orders ADD COLUMN deleted_at DATETIME NULL;`, (err) => {
  if (err && !err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
    console.error("Auto-migration orders deleted_at note:", err.message);
  }
});

// Auto-migrate orders table schema to include invoice_number
db.query(`
  ALTER TABLE orders 
  ADD COLUMN invoice_number VARCHAR(255) NULL;
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration orders invoice_number note:", err.message);
    }
  } else {
    console.log("Orders schema successfully updated for invoice_number.");
  }

  // Populate invoice_number for any existing rows where invoice_number IS NULL
  db.query(`
    UPDATE orders 
    SET invoice_number = CONCAT(
      '#TV', 
      DATE_FORMAT(COALESCE(created_at, NOW()), '%y%m%d'), 
      LPAD(id, 3, '0')
    )
    WHERE invoice_number IS NULL OR invoice_number = '';
  `, (errPop) => {
    if (errPop) {
      console.warn("Auto-populating order invoice_number note:", errPop.message);
    } else {
      console.log("Order invoice_number column successfully populated in database.");
    }
  });
});

// Auto-migrate hsn_codes table
db.query(`
  CREATE TABLE IF NOT EXISTS hsn_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hsn_code VARCHAR(255) NOT NULL,
    hsn_name VARCHAR(255) NOT NULL,
    tax_percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`, (err) => {
  if (err) {
    console.error("Auto-migration hsn_codes note:", err.message);
  } else {
    console.log("hsn_codes table successfully verified/created.");

    // Ensure hsn_code column exists for existing setups
    db.query("ALTER TABLE hsn_codes ADD COLUMN hsn_code VARCHAR(255) NULL", (errCol) => {
      // Column verification complete
    });
  }
});

// Auto-migrate categories table schema to include hsn_id
db.query(`
  ALTER TABLE categories 
  ADD COLUMN hsn_id INT NULL;
`, (err) => {
  if (err) {
    if (!err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
      console.error("Auto-migration categories hsn_id note:", err.message);
    }
  } else {
    console.log("Categories schema successfully updated for hsn_id.");
  }
});

// Auto-migrate gst_states table
db.query(`
  CREATE TABLE IF NOT EXISTS gst_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_code VARCHAR(50) NOT NULL,
    gst_state VARCHAR(255) NOT NULL,
    state_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`, (err) => {
  if (err) {
    console.error("Auto-migration gst_states note:", err.message);
  } else {
    console.log("gst_states table successfully verified/created.");

    // Ensure columns exist
    db.query("ALTER TABLE gst_states ADD COLUMN gst_state VARCHAR(255) NULL", () => {});
    db.query("ALTER TABLE gst_states ADD COLUMN state_name VARCHAR(255) NULL", () => {});

    // Populate gst_state & state_name for any existing rows where null
    db.query(`
      UPDATE gst_states 
      SET state_name = state_code
      WHERE state_name IS NULL OR state_name = '';
    `, () => {});

    db.query(`
      UPDATE gst_states 
      SET gst_state = CONCAT(LPAD(TRIM(state_code), 2, '0'), '-', TRIM(state_name))
      WHERE gst_state IS NULL OR gst_state = '';
    `, () => {});

    // Auto-seed default Indian states if empty or incomplete
    db.query("SELECT COUNT(*) AS cnt FROM gst_states", (cntErr, cntRows) => {
      if (!cntErr && (cntRows[0]?.cnt < 37)) {
        db.query("DELETE FROM gst_states", () => {
          const seedSql = "INSERT INTO gst_states (state_code, gst_state, state_name) VALUES ?";
          const seedValues = [
            ["01", "01-JAMMU AND KASHMIR", "JAMMU AND KASHMIR"],
            ["02", "02-HIMACHAL PRADESH", "HIMACHAL PRADESH"],
            ["03", "03-PUNJAB", "PUNJAB"],
            ["04", "04-CHANDIGARH", "CHANDIGARH"],
            ["05", "05-UTTARAKHAND", "UTTARAKHAND"],
            ["06", "06-HARYANA", "HARYANA"],
            ["07", "07-DELHI", "DELHI"],
            ["08", "08-RAJASTHAN", "RAJASTHAN"],
            ["09", "09-UTTAR PRADESH", "UTTAR PRADESH"],
            ["10", "10-BIHAR", "BIHAR"],
            ["11", "11-SIKKIM", "SIKKIM"],
            ["12", "12-ARUNACHAL PRADESH", "ARUNACHAL PRADESH"],
            ["13", "13-NAGALAND", "NAGALAND"],
            ["14", "14-MANIPUR", "MANIPUR"],
            ["15", "15-MIZORAM", "MIZORAM"],
            ["16", "16-TRIPURA", "TRIPURA"],
            ["17", "17-MEGHALAYA", "MEGHALAYA"],
            ["18", "18-ASSAM", "ASSAM"],
            ["19", "19-WEST BENGAL", "WEST BENGAL"],
            ["20", "20-JHARKHAND", "JHARKHAND"],
            ["21", "21-ODISHA", "ODISHA"],
            ["22", "22-CHHATTISGARH", "CHHATTISGARH"],
            ["23", "23-MADHYA PRADESH", "MADHYA PRADESH"],
            ["24", "24-GUJARAT", "GUJARAT"],
            ["26", "26-DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU"],
            ["27", "27-MAHARASHTRA", "MAHARASHTRA"],
            ["29", "29-KARNATAKA", "KARNATAKA"],
            ["30", "30-GOA", "GOA"],
            ["31", "31-LAKSHADWEEP", "LAKSHADWEEP"],
            ["32", "32-KERALA", "KERALA"],
            ["33", "33-TAMIL NADU", "TAMIL NADU"],
            ["34", "34-PUDUCHERRY", "PUDUCHERRY"],
            ["35", "35-ANDAMAN AND NICOBAR ISLANDS", "ANDAMAN AND NICOBAR ISLANDS"],
            ["36", "36-TELANGANA", "TELANGANA"],
            ["37", "37-ANDHRA PRADESH", "ANDHRA PRADESH"],
            ["38", "38-LADAKH", "LADAKH"],
            ["97", "97-OTHER TERRITORY", "OTHER TERRITORY"]
          ];
          db.query(seedSql, [seedValues], (sErr) => {
            if (sErr) console.error("Error seeding gst_states:", sErr);
            else console.log("Successfully pre-seeded 37+ official Indian GST States.");
          });
        });
      }
    });
  }
});

// Auto-migrate shipping_details table schema to include state_code and gst_state
db.query("ALTER TABLE shipping_details ADD COLUMN state_code VARCHAR(50) NULL", () => {});
db.query("ALTER TABLE shipping_details ADD COLUMN gst_state VARCHAR(255) NULL", () => {});

// Auto-update legacy direct store sale shipping states to configured Business State
db.query(`
  UPDATE shipping_details s
  JOIN orders o ON o.id = s.order_id
  SET s.state = (SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1)
  WHERE o.order_type = 'Store' AND (s.state = 'Store' OR s.state IS NULL OR s.state = '');
`, (err) => {
  if (err) {
    console.error("Auto-update store sale state note:", err.message);
  } else {
    console.log("Direct store sale shipping states updated to Business State.");
  }
});

// Auto-migrate order_items table schema to include tax snapshot columns
db.query(`
  ALTER TABLE order_items 
  ADD COLUMN gst_rate DECIMAL(5, 2) DEFAULT 0.00,
  ADD COLUMN taxable_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN igst_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN gst_state_name VARCHAR(255) NULL;
`, (err) => {
  if (err && !err.message.includes("duplicate column name") && !err.message.includes("Duplicate column name")) {
    console.error("Auto-migration order_items tax columns note:", err.message);
  } else {
    console.log("order_items schema successfully updated for tax snapshot columns.");

    // Backfill order_items tax values for existing orders
    db.query(`
      UPDATE order_items oi
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN hsn_codes h ON h.id = c.hsn_id
      LEFT JOIN categories pc ON pc.id = c.parent_id
      LEFT JOIN hsn_codes ph ON ph.id = pc.hsn_id
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN shipping_details s ON s.order_id = o.id
      SET 
        oi.gst_rate = COALESCE(h.tax_percentage, ph.tax_percentage, 0),
        oi.gst_state_name = COALESCE(NULLIF(TRIM(s.state), ''), (SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1), 'Tamil Nadu'),
        oi.taxable_amount = ROUND((oi.price * oi.quantity * 100) / (100 + COALESCE(h.tax_percentage, ph.tax_percentage, 0)), 2),
        oi.cgst_amount = CASE 
          WHEN o.order_type = 'Store' OR LOWER(REPLACE(COALESCE(s.state, ''), ' ', '')) = LOWER(REPLACE((SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1), ' ', '')) OR s.state IS NULL OR s.state = ''
          THEN ROUND(((oi.price * oi.quantity) - ((oi.price * oi.quantity * 100) / (100 + COALESCE(h.tax_percentage, ph.tax_percentage, 0)))) / 2, 2)
          ELSE 0.00 
        END,
        oi.sgst_amount = CASE 
          WHEN o.order_type = 'Store' OR LOWER(REPLACE(COALESCE(s.state, ''), ' ', '')) = LOWER(REPLACE((SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1), ' ', '')) OR s.state IS NULL OR s.state = ''
          THEN ROUND(((oi.price * oi.quantity) - ((oi.price * oi.quantity * 100) / (100 + COALESCE(h.tax_percentage, ph.tax_percentage, 0)))) / 2, 2)
          ELSE 0.00 
        END,
        oi.igst_amount = CASE 
          WHEN NOT (o.order_type = 'Store' OR LOWER(REPLACE(COALESCE(s.state, ''), ' ', '')) = LOWER(REPLACE((SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1), ' ', '')) OR s.state IS NULL OR s.state = '')
          THEN ROUND((oi.price * oi.quantity) - ((oi.price * oi.quantity * 100) / (100 + COALESCE(h.tax_percentage, ph.tax_percentage, 0))), 2)
          ELSE 0.00 
        END
      WHERE oi.taxable_amount = 0.00 OR oi.gst_state_name IS NULL;
    `, (errBackfill) => {
      if (errBackfill) console.error("Backfill order_items tax note:", errBackfill.message);
      else console.log("order_items tax snapshot successfully populated.");
    });
  }
});

// Auto-migrate user_logins table
db.query(`
  CREATE TABLE IF NOT EXISTS user_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`, (err) => {
  if (err) {
    console.error("Auto-migration user_logins note:", err.message);
  } else {
    console.log("user_logins table successfully verified/created.");
  }
});

export default db;
