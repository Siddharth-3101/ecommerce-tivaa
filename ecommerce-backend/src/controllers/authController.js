import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// =====================================================
// REGISTER USER
// =====================================================
export const registerUser = (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  // Check if email already exists
  const checkEmailQuery = "SELECT id FROM users WHERE email = ?";

  db.query(checkEmailQuery, [email], async (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = `
        INSERT INTO users (name, email, password, phone, address)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertUserQuery,
        [name, email, hashedPassword, phone || null, address || null],
        (err2) => {
          if (err2) {
            console.error("DB error:", err2);
            return res.status(500).json({ message: "Database error" });
          }

          return res.json({ message: "User registered successfully" });
        }
      );
    } catch (error) {
      console.error("Hashing error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  });
};

// =====================================================
// LOGIN USER
// =====================================================
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";

  db.query(findUserQuery, [email], async (err, users) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    // Compare password
    try {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Login error" });
    }
  });
};
