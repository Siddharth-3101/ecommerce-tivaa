import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const pendingRegistrations = new Map();

// =====================================================
// REGISTER USER
// =====================================================
export const registerUser = (req, res) => {
  const { name, email, password, phone, address, privacyAccepted, termsAccepted, marketingConsent } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  // Password strength policy
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    });
  }

  // Mobile number policy (10 digits)
  const phoneRegex = /^\d{10}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      message: "Mobile number must be exactly 10 digits."
    });
  }
  const checkDuplicateQuery = "SELECT id, email, phone, auth_provider, role FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)";

  db.query(checkDuplicateQuery, [email, phone || null], async (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      const existingEmail = result.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        if (existingEmail.auth_provider === "google" && existingEmail.role !== "admin") {
          return res.status(400).json({
            message: "This email is associated with a Google Sign-In account. Please sign in using Google."
          });
        }
        return res.status(400).json({ message: "Email already exists" });
      }

      if (phone) {
        const existingPhone = result.find(u => u.phone === phone);
        if (existingPhone) {
          return res.status(400).json({ message: "Mobile number is already registered" });
        }
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminEmail = process.env.ADMIN_EMAIL || "siddharth310107@gmail.com";
      const role = email === adminEmail ? "admin" : "user";

      // Generate secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in memory cache
      pendingRegistrations.set(email, {
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
        address: address || null,
        privacyAccepted: !!privacyAccepted,
        termsAccepted: !!termsAccepted,
        marketingConsent: !!marketingConsent,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiration
      });

      console.log("-----------------------------------------");
      console.log(`🔑 REGISTRATION OTP FOR ${email}:`);
      console.log(`OTP Code: ${otp}`);
      console.log("-----------------------------------------");

      // Send OTP via SMTP
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || '"Tivaa Elegance Support" <noreply@tivaajewelery.com>',
          to: email,
          subject: "Email Verification OTP - Tivaa Elegance",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #fff;">
              <h2 style="color: #7A38C2; text-align: center; margin-bottom: 24px; font-family: 'Playfair Display', Georgia, serif;">Verify Your Email</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for creating an account on Tivaa Elegance handcrafted jewelry store.</p>
              <p>Please use the following One-Time Password (OTP) to complete your registration. This OTP will expire in 10 minutes.</p>
              <div style="text-align: center; margin: 32px 0;">
                <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 6px; color: #7A38C2; border: 2px dashed #7A38C2; padding: 12px 28px; border-radius: 8px; background: #fffdfa; display: inline-block;">${otp}</span>
              </div>
              <p>If you did not request this verification code, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin-top: 32px;" />
              <p style="font-size: 0.8rem; color: #888; text-align: center;">Tivaa Elegance &copy; 2026</p>
            </div>
          `,
        };

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return res.json({ otpSent: true, email, message: "Verification OTP sent to your email" });
      } catch (mailError) {
        console.warn("📧 Email sending failed, fallback to console log:", mailError.message);
        return res.json({ 
          otpSent: true,
          email,
          message: "Verification OTP generated successfully (logged to server console)",
          dev_fallback_otp: otp 
        });
      }
    } catch (error) {
      console.error("Hashing/Registration error:", error);
      return res.status(500).json({ message: "Error initiating registration" });
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

    if (user.auth_provider === "google" && user.role !== "admin") {
      return res.status(400).json({
        message: "This account was created using Google Sign-In. Please sign in using Google."
      });
    }

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
        process.env.JWT_SECRET || "mysupersecretkey",
        { expiresIn: "7d" }
      );

      // Log user login event
      db.query("INSERT INTO user_logins (user_id) VALUES (?)", [user.id], (logErr) => {
        if (logErr) console.error("Error logging user login event:", logErr);
      });

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

        if (user.auth_provider !== "google" && user.role !== "admin") {
          return res.status(400).json({
            message: "This email is registered with a manual account. Please log in using your password."
          });
        }
        
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
          process.env.JWT_SECRET || "mysupersecretkey",
          { expiresIn: "7d" }
        );

        // Log user login event
        db.query("INSERT INTO user_logins (user_id) VALUES (?)", [user.id], (logErr) => {
          if (logErr) console.error("Error logging user login event:", logErr);
        });

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
            INSERT INTO users (name, email, password, role, auth_provider)
            VALUES (?, ?, ?, ?, 'google')
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
                process.env.JWT_SECRET || "mysupersecretkey",
                { expiresIn: "7d" }
              );

              // Log user login event
              db.query("INSERT INTO user_logins (user_id) VALUES (?)", [newUserId], (logErr) => {
                if (logErr) console.error("Error logging user login event:", logErr);
              });

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

  const findUserQuery = "SELECT id, auth_provider, role FROM users WHERE email = ?";

  db.query(findUserQuery, [email], async (err, users) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const user = users[0];

    if (user.auth_provider === "google" && user.role !== "admin") {
      return res.status(400).json({
        message: "This account was created using Google Sign-In. Please sign in using Google."
      });
    }

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
              <p style="font-size: 0.8rem; color: #888; text-align: center;">Tivaa Elegance &copy; 2026</p>
            </div>
          `,
        };

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,  // Your Gmail address e.g. yourname@gmail.com
            pass: process.env.SMTP_PASS,  // Gmail App Password (NOT your regular password)
          },
        });

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
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

  // Password strength policy
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    });
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

export const verifyRegister = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const pending = pendingRegistrations.get(email);
  if (!pending) {
    return res.status(400).json({ message: "No registration in progress for this email, or OTP expired" });
  }

  if (Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(email);
    return res.status(400).json({ message: "OTP has expired. Please register again" });
  }

  if (pending.otp !== otp) {
    return res.status(400).json({ message: "Incorrect OTP code" });
  }

  // Double check if email already exists in DB in the meantime
  const checkEmailQuery = "SELECT id FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (errCheck, resultCheck) => {
    if (errCheck) {
      console.error("DB check error:", errCheck);
      return res.status(500).json({ message: "Database error" });
    }

    if (resultCheck.length > 0) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: "Email already exists" });
    }

    const { name, password, role, phone, address, privacyAccepted, termsAccepted, marketingConsent } = pending;
    const now = new Date();

    const insertUserQuery = `
      INSERT INTO users (
        name, email, password, role, phone, address, auth_provider,
        privacy_policy_accepted, privacy_policy_accepted_on,
        terms_accepted, terms_accepted_on,
        marketing_consent, marketing_consent_on
      )
      VALUES (?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertUserQuery,
      [
        name, email, password, role, phone, address,
        privacyAccepted ? 1 : 0, privacyAccepted ? now : null,
        termsAccepted ? 1 : 0, termsAccepted ? now : null,
        marketingConsent ? 1 : 0, marketingConsent ? now : null
      ],
      (errInsert) => {
        if (errInsert) {
          console.error("DB error creating user from verified registration:", errInsert);
          return res.status(500).json({ message: "Database error" });
        }

        pendingRegistrations.delete(email);
        return res.json({ message: "User registered successfully!" });
      }
    );
  });
};

// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, address, city, state, pincode, currentPassword, newPassword } = req.body;

  // Find the current user
  db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, users) => {
    if (err) {
      console.error("DB error finding user for profile update:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    let updateFields = [];
    let updateValues = [];

    // 1. Check Name
    if (name) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    // 2. Check Address, City, State, Pincode
    if (address !== undefined) {
      updateFields.push("address = ?");
      updateValues.push(address || null);
    }
    if (city !== undefined) {
      updateFields.push("city = ?");
      updateValues.push(city || null);
    }
    if (state !== undefined) {
      updateFields.push("state = ?");
      updateValues.push(state || null);
    }
    if (pincode !== undefined) {
      updateFields.push("pincode = ?");
      updateValues.push(pincode || null);
    }

    // 3. Check Phone (Mobile Number validation for 10 digits, uniqueness)
    if (phone && phone !== user.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits." });
      }

      // Check duplicate phone
      try {
        const checkPhone = await new Promise((resolve, reject) => {
          db.query("SELECT id FROM users WHERE phone = ? AND id != ?", [phone, userId], (errCheck, results) => {
            if (errCheck) reject(errCheck);
            else resolve(results && results.length > 0);
          });
        });
        if (checkPhone) {
          return res.status(400).json({ message: "Mobile number is already registered to another account." });
        }
      } catch (checkErr) {
        console.error("Error checking phone duplicate:", checkErr);
        return res.status(500).json({ message: "Database error checking phone duplicates" });
      }

      updateFields.push("phone = ?");
      updateValues.push(phone);
    }

    // 4. Check Email (Uniqueness)
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      // Check duplicate email
      try {
        const checkEmail = await new Promise((resolve, reject) => {
          db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId], (errCheck, results) => {
            if (errCheck) reject(errCheck);
            else resolve(results && results.length > 0);
          });
        });
        if (checkEmail) {
          return res.status(400).json({ message: "Email is already registered to another account." });
        }
      } catch (checkErr) {
        console.error("Error checking email duplicate:", checkErr);
        return res.status(500).json({ message: "Database error checking email duplicates" });
      }

      updateFields.push("email = ?");
      updateValues.push(email);
    }

    // 5. Change Password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password." });
      }

      try {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Incorrect current password." });
        }
      } catch (compareErr) {
        console.error("Password comparison error:", compareErr);
        return res.status(500).json({ message: "Error verifying current password" });
      }

      // Enforce strength policy
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message: "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateFields.push("password = ?");
        updateValues.push(hashedPassword);
      } catch (hashError) {
        console.error("Hashing error during profile password update:", hashError);
        return res.status(500).json({ message: "Error hashing new password" });
      }
    }

    if (updateFields.length === 0) {
      return res.json({ message: "No changes to update." });
    }

    updateValues.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(updateQuery, updateValues, (updateErr) => {
      if (updateErr) {
        console.error("Profile update query error:", updateErr);
        return res.status(500).json({ message: "Database error updating profile" });
      }

      // Return updated user data (except password)
      db.query("SELECT id, name, email, role, phone, address, city, state, pincode FROM users WHERE id = ?", [userId], (errSelect, rows) => {
        if (errSelect || rows.length === 0) {
          return res.json({ message: "Profile updated successfully!" });
        }
        return res.json({
          message: "Profile updated successfully!",
          user: rows[0]
        });
      });
    });
  });
};
