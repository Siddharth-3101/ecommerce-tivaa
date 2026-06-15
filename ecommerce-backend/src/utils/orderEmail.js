import db from "../config/db.js";
import nodemailer from "nodemailer";

export const sendOrderEmailToAdmins = async (orderId) => {
  try {
    console.log(`[orderEmail] Preparing to send admin notification for order #${orderId}`);
    
    // 1. Fetch order metadata, shipping details, and customer info
    const orderQuery = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
             s.address, s.city, s.state, s.pincode, s.phone
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN shipping_details s ON s.order_id = o.id
      WHERE o.id = ?
    `;

    const orderRows = await new Promise((resolve, reject) => {
      db.query(orderQuery, [orderId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (orderRows.length === 0) {
      console.warn(`[orderEmail] Order ID ${orderId} not found in DB`);
      return;
    }

    const order = orderRows[0];
    const formattedOrderId = "TEJWL" + String(order.id).padStart(2, '0');

    // 2. Fetch order items with product details
    const itemsQuery = `
      SELECT oi.*, p.name AS product_name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `;

    const items = await new Promise((resolve, reject) => {
      db.query(itemsQuery, [orderId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 3. Format the email HTML body
    const emailsList = ["lalithanagaraj@gmail.com", "siddharth310107@gmail.com", "rohinitn@gmail.com"];

    const itemsListHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">
          <strong>${item.product_name}</strong>
          ${item.selected_variation ? `<br/><span style="color: #777; font-size: 0.85em;">Variant: ${item.selected_variation}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Tivaa Elegance Store" <noreply@tivaajewelery.com>',
      to: emailsList.join(", "),
      subject: `New Order Alert: Order #${formattedOrderId} - Tivaa Elegance`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #7A38C2; text-align: center; border-bottom: 2px solid #7A38C2; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif;">New Order Placed!</h2>
          <p>Hello Admins,</p>
          <p>A new order has been successfully paid and placed on Tivaa Elegance jewelry store.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.95em;">
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Order ID:</strong></td>
              <td style="padding: 6px 0; text-align: right;">#${formattedOrderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Customer Name:</strong></td>
              <td style="padding: 6px 0; text-align: right;">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Customer Email:</strong></td>
              <td style="padding: 6px 0; text-align: right;">${order.customer_email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Payment Method:</strong></td>
              <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${order.payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Razorpay Order ID:</strong></td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace;">${order.razorpay_order_id || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Order Date:</strong></td>
              <td style="padding: 6px 0; text-align: right;">${new Date(order.created_at).toLocaleString()}</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; text-align: left;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">
            <thead>
              <tr style="background: #f7f7f7;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; border-top: 1px solid #ddd; color: #666;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; border-top: 1px solid #ddd;">₹${(Number(order.total || 0) - Number(order.shipping_cost || 0)).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">₹${Number(order.shipping_cost || 0).toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td colspan="3" style="padding: 15px 10px 10px 10px; text-align: right; border-top: 1px solid #ddd;">Total Amount Paid:</td>
                <td style="padding: 15px 10px 10px 10px; text-align: right; color: #7A38C2; border-top: 1px solid #ddd;">₹${order.total}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; text-align: left;">Shipping Address</h3>
          <p style="background: #f9f9f9; padding: 12px; border-radius: 6px; font-size: 0.95em; line-height: 1.5; color: #444; margin-top: 8px; text-align: left;">
            <strong>${order.customer_name}</strong><br/>
            ${order.address}<br/>
            ${order.city}, ${order.state} - ${order.pincode}<br/>
            <strong>Phone:</strong> ${order.phone || 'N/A'}
          </p>

          <div style="text-align: center; margin-top: 32px;">
            <a href="http://tivaajewelery.us-east-1.elasticbeanstalk.com/admin/orders/${order.id}" 
               style="background: #7A38C2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(122, 56, 194, 0.35);">
              Manage Order in Admin Panel
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 32px;" />
          <p style="font-size: 0.8rem; color: #888; text-align: center;">Tivaa Elegance Jewellers &copy; 2026</p>
        </div>
      `,
    };

    // 4. Initialize nodemailer transporter exactly like forgot password (gmail service)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
    console.log(`✅ [orderEmail] Admin notification emails successfully sent for Order #${formattedOrderId}`);
  } catch (error) {
    console.error(`❌ [orderEmail] Failed to send order email alert for Order #${orderId}:`, error);
  }
};

export const sendOrderEmailToCustomer = async (orderId) => {
  try {
    console.log(`[orderEmail] Preparing to send customer confirmation for order #${orderId}`);
    
    // 1. Fetch order metadata, shipping details, and customer info
    const orderQuery = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
             s.address, s.city, s.state, s.pincode, s.phone
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN shipping_details s ON s.order_id = o.id
      WHERE o.id = ?
    `;

    const orderRows = await new Promise((resolve, reject) => {
      db.query(orderQuery, [orderId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (orderRows.length === 0) {
      console.warn(`[orderEmail] Order ID ${orderId} not found in DB`);
      return;
    }

    const order = orderRows[0];
    const formattedOrderId = "TEJWL" + String(order.id).padStart(2, '0');

    // 2. Fetch order items with product details
    const itemsQuery = `
      SELECT oi.*, p.name AS product_name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `;

    const items = await new Promise((resolve, reject) => {
      db.query(itemsQuery, [orderId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const itemsListHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">
          <strong>${item.product_name}</strong>
          ${item.selected_variation ? `<br/><span style="color: #777; font-size: 0.85em;">Variant: ${item.selected_variation}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Tivaa Elegance Store" <noreply@tivaajewelery.com>',
      to: order.customer_email,
      subject: `Your Order Confirmation: ${formattedOrderId} - Tivaa Elegance`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #7A38C2; text-align: center; border-bottom: 2px solid #7A38C2; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Playfair Display', Georgia, serif;">Thank you for your purchase!</h2>
          <p>Dear ${order.customer_name},</p>
          <p>We are delighted to confirm that your order on Tivaa Elegance was successfully placed and paid. Our boutique designers are already preparing your premium handcrafted jewelry pieces.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.95em;">
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Order Number:</strong></td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #7A38C2;">${formattedOrderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Payment Method:</strong></td>
              <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${order.payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666; text-align: left;"><strong>Order Date:</strong></td>
              <td style="padding: 6px 0; text-align: right;">${new Date(order.created_at).toLocaleString()}</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; text-align: left;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">
            <thead>
              <tr style="background: #f7f7f7;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; border-top: 1px solid #ddd; color: #666;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; border-top: 1px solid #ddd;">₹${(Number(order.total || 0) - Number(order.shipping_cost || 0)).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">₹${Number(order.shipping_cost || 0).toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td colspan="3" style="padding: 15px 10px 10px 10px; text-align: right; border-top: 1px solid #ddd;">Total Paid:</td>
                <td style="padding: 15px 10px 10px 10px; text-align: right; color: #7A38C2; border-top: 1px solid #ddd;">₹${order.total}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #333; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; text-align: left;">Delivery Address</h3>
          <p style="background: #f9f9f9; padding: 12px; border-radius: 6px; font-size: 0.95em; line-height: 1.5; color: #444; margin-top: 8px; text-align: left;">
            <strong>${order.customer_name}</strong><br/>
            ${order.address}<br/>
            ${order.city}, ${order.state} - ${order.pincode}<br/>
            <strong>Phone:</strong> ${order.phone || 'N/A'}
          </p>

          <p style="font-size: 0.95em; margin-top: 24px; line-height: 1.5; color: #555;">
            We will email you a shipping notification with your tracking details as soon as your package has been shipped.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 32px;" />
          <p style="font-size: 0.8rem; color: #888; text-align: center;">Tivaa Elegance Jewellers &copy; 2026</p>
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
    console.log(`✅ [orderEmail] Customer confirmation email successfully sent to ${order.customer_email} for Order #${formattedOrderId}`);
  } catch (error) {
    console.error(`❌ [orderEmail] Failed to send order email confirmation to customer for Order #${orderId}:`, error);
  }
};
