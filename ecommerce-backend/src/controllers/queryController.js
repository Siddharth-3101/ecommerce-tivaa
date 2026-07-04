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
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
              <!-- Logo / Header -->
              <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                <h2 style="margin: 0; color: #7A38C2; font-size: 1.5rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">Tivaa Elegance</h2>
                <span style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Support Desk</span>
              </div>
              
              <p style="font-size: 1rem; color: #1e293b; line-height: 1.6; margin-top: 0;">Hello <strong>${queryData.name}</strong>,</p>
              <p style="font-size: 0.95rem; color: #475569; line-height: 1.6;">We have processed your inquiry regarding <strong>"${queryData.subject}"</strong>:</p>
              
              <!-- User Message -->
              <div style="background: #f8fafc; border-left: 4px solid #94a3b8; margin: 16px 0; padding: 16px 20px; border-radius: 0 12px 12px 0; font-style: italic; color: #475569; font-size: 0.92rem; line-height: 1.6;">
                "${queryData.message}"
              </div>
              
              <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin-top: 24px;"><strong>Here is our response to your query:</strong></p>
              
              <!-- Admin Response -->
              <div style="background: rgba(122, 56, 194, 0.03); border: 1px solid rgba(122, 56, 194, 0.15); padding: 20px; border-radius: 12px; color: #1e293b; font-size: 0.98rem; line-height: 1.65; margin: 12px 0 28px 0; font-weight: 500;">
                ${reply}
              </div>
              
              <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6; text-align: center; margin-bottom: 24px;">If you have any further questions, feel free to reply directly to this email or visit our website.</p>
              
              <!-- CTA Button to Store -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="http://tivaajewelery.us-east-1.elasticbeanstalk.com/products" style="background: #7A38C2; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 4px 12px rgba(122, 56, 194, 0.25);">
                  Continue Shopping
                </a>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
                <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 4px 0;">This is an automated support response for your query.</p>
                <p style="font-size: 0.78rem; color: #94a3b8; margin: 0; font-weight: 600;">Tivaa Elegance &copy; 2026</p>
              </div>
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
