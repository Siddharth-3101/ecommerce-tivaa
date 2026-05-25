import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
      const adminEmail = process.env.ADMIN_EMAIL || "siddharth310107@gmail.com";
      const role = email === adminEmail ? "admin" : "user";

      const insertUserQuery = `
        INSERT INTO users (name, email, password, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertUserQuery,
        [name, email, hashedPassword, role, phone || null, address || null],
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

    // Compare password (supports both secure bcrypt and plain-text fallbacks)
    try {
      let isValidPassword = false;
      if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$"))) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        isValidPassword = (password === user.password);
      }

      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Automatically promote user to admin in DB if their email matches ADMIN_EMAIL or default owner
      const adminEmail = process.env.ADMIN_EMAIL || "siddharth310107@gmail.com";
      if (user.email === adminEmail && user.role !== "admin") {
        db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id], (updateErr) => {
          if (updateErr) {
            console.error("Failed to dynamically upgrade user to admin:", updateErr);
          } else {
            console.log(`Successfully upgraded ${user.email} to admin dynamically`);
          }
        });
        user.role = "admin";
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

// =====================================================
// GOOGLE SIGN-IN / REGISTER
// =====================================================
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID Token is required" });
  }

  try {
    // Validate Google Token using Google's Tokeninfo API
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) {
      return res.status(400).json({ message: "Invalid Google ID token" });
    }

    const payload = await googleRes.json();
    const { email, name, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email is not verified" });
    }

    // Check if user already exists in our DB
    const findUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(findUserQuery, [email], async (err, users) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (users.length > 0) {
        // User exists, log them in
        const user = users[0];
        
        // Automatically promote user to admin in DB if their email matches ADMIN_EMAIL or default owner
        const adminEmail = process.env.ADMIN_EMAIL || "siddharth310107@gmail.com";
        if (user.email === adminEmail && user.role !== "admin") {
          db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id], (updateErr) => {
            if (updateErr) {
              console.error("Failed to dynamically upgrade Google user to admin:", updateErr);
            } else {
              console.log(`Successfully upgraded Google user ${user.email} to admin dynamically`);
            }
          });
          user.role = "admin";
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
      } else {
        // User does not exist, automatically register them
        try {
          const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const adminEmail = process.env.ADMIN_EMAIL || "siddharth310107@gmail.com";
          const role = email === adminEmail ? "admin" : "user";

          const insertUserQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            insertUserQuery,
            [name, email, hashedPassword, role],
            (err2, result) => {
              if (err2) {
                console.error("DB error:", err2);
                return res.status(500).json({ message: "Database error" });
              }

              const newUserId = result.insertId;

              // Generate JWT for the newly registered user
              const token = jwt.sign(
                {
                  id: newUserId,
                  email: email,
                  role: role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );

              return res.json({
                message: "Login successful",
                token,
                user: {
                  id: newUserId,
                  name: name,
                  email: email,
                  role: role,
                },
              });
            }
          );
        } catch (hashError) {
          console.error("Hashing error:", hashError);
          return res.status(500).json({ message: "Error registering new user" });
        }
      }
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ message: "Internal server error during Google auth" });
  }
};

// =====================================================
// FORGOT PASSWORD (OTP-BASED)
// =====================================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const findUserQuery = "SELECT id FROM users WHERE email = ?";

  db.query(findUserQuery, [email], async (err, users) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const user = users[0];

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    const updateTokenQuery = "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?";

    db.query(updateTokenQuery, [otp, expires, user.id], async (err2) => {
      if (err2) {
        console.error("DB error updating token:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("-----------------------------------------");
      console.log(`🔑 PASSWORD RESET OTP FOR ${email}:`);
      console.log(`OTP Code: ${otp}`);
      console.log("-----------------------------------------");

      // Try sending mail
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || '"Tivaa Elegance Support" <noreply@tivaajewelery.com>',
          to: email,
          subject: "Password Reset OTP - Tivaa Elegance",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #fff;">
              <h2 style="color: #c98e57; text-align: center; margin-bottom: 24px;">Password Reset Verification</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your account on Tivaa Elegance jewelry store.</p>
              <p>Please use the following One-Time Password (OTP) to reset your password. This OTP will expire in 15 minutes.</p>
              <div style="text-align: center; margin: 32px 0;">
                <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 6px; color: #c98e57; border: 2px dashed #c98e57; padding: 12px 28px; border-radius: 8px; background: #fffdfa; display: inline-block;">${otp}</span>
              </div>
              <p>If you did not request a password reset, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin-top: 32px;" />
              <p style="font-size: 0.8rem; color: #888; text-align: center;">Tivaa Elegance Jewellers &copy; 2026</p>
            </div>
          `,
        };

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.mailtrap.io",
          port: process.env.SMTP_PORT || 2525,
          auth: {
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASS || "",
          },
        });

        await transporter.sendMail(mailOptions);
        return res.json({ message: "Password reset OTP sent to your email" });
      } catch (mailError) {
        console.warn("📧 Email sending failed, fallback to console log:", mailError.message);
        return res.json({ 
          message: "Reset OTP generated successfully (logged to server console)",
          dev_fallback_otp: otp 
        });
      }
    });
  });
};

// =====================================================
// RESET PASSWORD (OTP-BASED)
// =====================================================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  // Find user with correct email and active OTP
  const findUserQuery = "SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()";

  db.query(findUserQuery, [email, otp], async (err, users) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = users[0];

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePasswordQuery = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?";

      db.query(updatePasswordQuery, [hashedPassword, user.id], (err2) => {
        if (err2) {
          console.error("DB error updating password:", err2);
          return res.status(500).json({ message: "Database error" });
        }

        return res.json({ message: "Password reset successfully! You can now log in." });
      });
    } catch (hashError) {
      console.error("Hashing error during password reset:", hashError);
      return res.status(500).json({ message: "Failed to reset password" });
    }
  });
};

