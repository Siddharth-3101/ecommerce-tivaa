import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Invalid token format" });

  jwt.verify(token, process.env.JWT_SECRET || "mysupersecretkey", (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

// =======================================================
// RETURN CURRENT USER DETAILS
// =======================================================
export const currentUser = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, name, email, role FROM users WHERE id = ?";

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  });
};
