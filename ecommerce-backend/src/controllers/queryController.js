import db from "../config/db.js";
import nodemailer from "nodemailer";

// ===========================================================
// PUBLIC: SUBMIT CUSTOMER QUERY
// ===========================================================
export const submitQuery = (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields (name, email, subject, message) are required" });
  }

  const sql = `
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("DB Error submitting query:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json({ message: "Your query has been submitted successfully! We will get back to you shortly." });
  });
};

// ===========================================================
// ADMIN: GET ALL QUERIES
// ===========================================================
export const adminGetQueries = (req, res) => {
  const sql = "SELECT * FROM contact_messages ORDER BY created_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("DB Error getting queries:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(rows);
  });
};

// ===========================================================
// ADMIN: REPLY TO CUSTOMER QUERY
// ===========================================================
export const adminReplyQuery = (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: "Reply message is required" });
  }

  // Fetch the query details first to get the user's email
  db.query("SELECT * FROM contact_messages WHERE id = ?", [id], async (err, rows) => {
    if (err) {
      console.error("DB Error finding query:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Query not found" });
    }

    const queryData = rows[0];

    // Update query status and reply text in DB
    const updateSql = "UPDATE contact_messages SET reply = ?, status = 'replied' WHERE id = ?";
    db.query(updateSql, [reply, id], async (updateErr) => {
      if (updateErr) {
        console.error("DB Error updating query reply:", updateErr);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("-----------------------------------------");
      console.log(`✉️ REPLY DISPATCHED FOR QUERY #${id} (to: ${queryData.email}):`);
      console.log(`Reply: ${reply}`);
      console.log("-----------------------------------------");

      // Send email notification to user containing the reply
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || '"Tivaa Elegance Support" <noreply@tivaajewelery.com>',
          to: queryData.email,
          subject: `Reply to your query: ${queryData.subject} - Tivaa Elegance`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #fff;">
              <h2 style="color: #c98e57; text-align: center;">Query Response</h2>
              <p>Hello ${queryData.name},</p>
              <p>We received your inquiry regarding <strong>"${queryData.subject}"</strong>:</p>
              <blockquote style="background: #f9f9f9; border-left: 4px solid #c98e57; margin: 1.5em 10px; padding: 12px 20px; font-style: italic; color: #555;">
                "${queryData.message}"
              </blockquote>
              <p>Here is our response to your query:</p>
              <div style="background: rgba(201, 142, 87, 0.05); border: 1px solid rgba(201, 142, 87, 0.2); padding: 18px; border-radius: 8px; color: #362e2a; font-weight: 500; line-height: 1.6; margin-bottom: 24px;">
                ${reply}
              </div>
              <p>If you have any further questions, feel free to reply directly to this email or visit our FAQ page.</p>
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
        return res.json({ message: "Reply registered and email sent successfully!" });
      } catch (mailError) {
        console.warn("📧 Reply email failed, fallback to console:", mailError.message);
        return res.json({ 
          message: "Reply registered successfully (email logged to server console)",
          dev_fallback_reply: reply 
        });
      }
    });
  });
};
