import db from "../config/db.js";

// GET ALL SETTINGS
export const getSettings = (req, res) => {
  const sql = "SELECT * FROM settings";
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    return res.json(settings);
  });
};

// UPDATE SETTINGS (Admin Only)
export const updateSettings = (req, res) => {
  const { settings } = req.body;
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ message: "Invalid settings object" });
  }

  const entries = Object.entries(settings);
  if (entries.length === 0) {
    return res.json({ message: "No settings to update" });
  }

  let completed = 0;
  let hasError = false;

  entries.forEach(([key, value]) => {
    const sql = "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?";
    db.query(sql, [key, value, value], (err) => {
      completed++;
      if (err) {
        console.error(`Error updating setting ${key}:`, err);
        hasError = true;
      }
      
      if (completed === entries.length) {
        if (hasError) {
          return res.status(500).json({ message: "Failed to update some settings" });
        }
        return res.json({ message: "Settings updated successfully" });
      }
    });
  });
};
