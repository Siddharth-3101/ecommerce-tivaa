import dotenv from "dotenv";
dotenv.config();
import db from "../src/config/db.js";

async function populateTestOrders() {
  console.log("Starting comprehensive test data population for Jan, Feb, Mar 2026...");

  // 1. Ensure 4 HSN Codes with 4 Tax Slabs (3%, 5%, 12%, 18%)
  await new Promise((res) => db.query("UPDATE hsn_codes SET tax_percentage = 18.00 WHERE hsn_code = '4202'", () => res()));
  await new Promise((res) => db.query("UPDATE hsn_codes SET tax_percentage = 12.00 WHERE hsn_code = '9615'", () => res()));
  await new Promise((res) => db.query("UPDATE hsn_codes SET tax_percentage = 5.00 WHERE hsn_code = '7323'", () => res()));
  await new Promise((res) => db.query("UPDATE hsn_codes SET tax_percentage = 3.00 WHERE hsn_code = '7117'", () => res()));

  // Ensure categories exist and are mapped to HSNs
  await new Promise((res) => db.query("UPDATE categories SET hsn_id = 9 WHERE id IN (2, 5, 6, 7, 12, 13, 14, 15)", () => res()));
  await new Promise((res) => db.query("UPDATE categories SET hsn_id = 5 WHERE id IN (1, 10)", () => res()));
  await new Promise((res) => db.query("UPDATE categories SET hsn_id = 8 WHERE id IN (16)", () => res()));
  await new Promise((res) => db.query("UPDATE categories SET hsn_id = 6 WHERE id IN (11)", () => res()));

  // Fetch Business State
  const bizStateRow = await new Promise((res) => db.query("SELECT value FROM settings WHERE `key` = 'business_state'", (e, r) => res(r)));
  const bizState = (bizStateRow && bizStateRow.length > 0 && bizStateRow[0].value) ? bizStateRow[0].value.trim() : "Tamil Nadu";
  const cleanBizState = bizState.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Get Admin user ID
  const adminRow = await new Promise((res) => db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1", (e, r) => res(r)));
  const adminId = adminRow[0]?.id || 1;

  // Test Customer Profiles
  const customers = [
    { name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "9876543210", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
    { name: "Rajesh Kumar", email: "rajesh.kumar@example.com", phone: "9811223344", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    { name: "Priya Sundaram", email: "priya.sundaram@example.com", phone: "9444112233", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
    { name: "Vikram Malhotra", email: "vikram.m@example.com", phone: "9810998877", city: "New Delhi", state: "Delhi", pincode: "110001" },
    { name: "Amit Verma", email: "amit.verma@example.com", phone: "9935112233", city: "Patna", state: "Bihar", pincode: "800001" },
    { name: "Suresh Gupta", email: "suresh.g@example.com", phone: "9415001122", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" }
  ];

  // Test Order Configurations (Including all 4 HSN Slabs across Jan, Feb, Mar 2026)
  // Product 142 = HSN 7117 (3%)
  // Product 4 = HSN 7323 (5%)
  // Product 76 = HSN 9615 (12%)
  // Product 129 = HSN 4202 (18%)
  const testOrderSpecs = [
    // --- JANUARY 2026 ---
    { date: "2026-01-08 10:30:00", type: "Online", custIdx: 0, items: [{ prodId: 142, qty: 2, price: 250, gstRate: 3 }, { prodId: 4, qty: 1, price: 1250, gstRate: 5 }], pm: "Razorpay" },
    { date: "2026-01-14 14:15:00", type: "Store", custIdx: 2, items: [{ prodId: 76, qty: 3, price: 350, gstRate: 12 }], pm: "UPI" },
    { date: "2026-01-20 16:45:00", type: "Online", custIdx: 1, items: [{ prodId: 129, qty: 2, price: 450, gstRate: 18 }], pm: "COD" },
    { date: "2026-01-25 11:20:00", type: "Online", custIdx: 4, items: [{ prodId: 142, qty: 4, price: 250, gstRate: 3 }, { prodId: 77, qty: 2, price: 350, gstRate: 12 }], pm: "Razorpay" },
    { date: "2026-01-29 18:10:00", type: "Store", custIdx: 2, items: [{ prodId: 4, qty: 2, price: 1250, gstRate: 5 }, { prodId: 130, qty: 1, price: 500, gstRate: 18 }], pm: "Cash" },

    // --- FEBRUARY 2026 ---
    { date: "2026-02-04 09:40:00", type: "Online", custIdx: 3, items: [{ prodId: 76, qty: 2, price: 350, gstRate: 12 }, { prodId: 129, qty: 1, price: 450, gstRate: 18 }], pm: "Razorpay" },
    { date: "2026-02-10 15:30:00", type: "Store", custIdx: 2, items: [{ prodId: 142, qty: 5, price: 250, gstRate: 3 }], pm: "UPI" },
    { date: "2026-02-16 12:00:00", type: "Online", custIdx: 5, items: [{ prodId: 4, qty: 3, price: 1250, gstRate: 5 }], pm: "COD" },
    { date: "2026-02-22 17:15:00", type: "Online", custIdx: 0, items: [{ prodId: 130, qty: 2, price: 500, gstRate: 18 }], pm: "Razorpay" },
    { date: "2026-02-27 13:50:00", type: "Store", custIdx: 2, items: [{ prodId: 77, qty: 4, price: 350, gstRate: 12 }, { prodId: 142, qty: 2, price: 250, gstRate: 3 }], pm: "Cash" },

    // --- MARCH 2026 ---
    { date: "2026-03-03 11:10:00", type: "Online", custIdx: 1, items: [{ prodId: 142, qty: 3, price: 250, gstRate: 3 }, { prodId: 129, qty: 2, price: 450, gstRate: 18 }], pm: "Razorpay" },
    { date: "2026-03-08 14:00:00", type: "Online", custIdx: 4, items: [{ prodId: 4, qty: 2, price: 1250, gstRate: 5 }, { prodId: 76, qty: 2, price: 350, gstRate: 12 }], pm: "COD" },
    { date: "2026-03-14 16:25:00", type: "Store", custIdx: 2, items: [{ prodId: 130, qty: 3, price: 500, gstRate: 18 }], pm: "UPI" },
    { date: "2026-03-19 10:45:00", type: "Online", custIdx: 3, items: [{ prodId: 77, qty: 3, price: 350, gstRate: 12 }, { prodId: 142, qty: 4, price: 250, gstRate: 3 }], pm: "Razorpay" },
    { date: "2026-03-24 15:50:00", type: "Online", custIdx: 5, items: [{ prodId: 5, qty: 2, price: 1250, gstRate: 5 }, { prodId: 129, qty: 1, price: 450, gstRate: 18 }], pm: "Razorpay" },
    { date: "2026-03-29 17:30:00", type: "Store", custIdx: 2, items: [{ prodId: 142, qty: 2, price: 250, gstRate: 3 }, { prodId: 76, qty: 1, price: 350, gstRate: 12 }], pm: "Cash" }
  ];

  for (const spec of testOrderSpecs) {
    const cust = customers[spec.custIdx];
    const isStore = spec.type === "Store";
    const saleState = isStore ? bizState : cust.state;
    const cleanSaleState = saleState.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isSameState = isStore || cleanSaleState === cleanBizState;

    // Calculate totals
    const subtotal = spec.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingCost = isStore ? 0.00 : 50.00;
    const total = subtotal + shippingCost;

    // Insert order
    const sqlOrder = `
      INSERT INTO orders (user_id, total, shipping_cost, payment_method, order_status, order_type, created_at)
      VALUES (?, ?, ?, ?, 'delivered', ?, ?)
    `;
    const orderRes = await new Promise((res) => db.query(sqlOrder, [adminId, total, shippingCost, spec.pm, spec.type, spec.date], (e, r) => res(r)));
    const orderId = orderRes.insertId;

    // Insert order items with tax snapshot
    const itemValues = spec.items.map((item) => {
      const qty = item.qty;
      const unitPrice = item.price;
      const lineTotal = unitPrice * qty;
      const gstRate = Number(item.gstRate);

      const taxableAmount = Number(((lineTotal * 100) / (100 + gstRate)).toFixed(2));
      const totalTax = Number((lineTotal - taxableAmount).toFixed(2));

      let cgst = 0.00;
      let sgst = 0.00;
      let igst = 0.00;

      if (isSameState) {
        cgst = Number((totalTax / 2).toFixed(2));
        sgst = Number((totalTax / 2).toFixed(2));
      } else {
        igst = totalTax;
      }

      return [
        orderId,
        item.prodId,
        qty,
        unitPrice,
        "Standard",
        gstRate,
        taxableAmount,
        cgst,
        sgst,
        igst,
        saleState,
        spec.date
      ];
    });

    const sqlItems = `
      INSERT INTO order_items (order_id, product_id, quantity, price, selected_variation, gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, gst_state_name, created_at)
      VALUES ?
    `;
    await new Promise((res) => db.query(sqlItems, [itemValues], (e, r) => res(r)));

    // Insert shipping details
    const sqlShip = `
      INSERT INTO shipping_details (order_id, address, city, state, pincode, phone, shipped_date, delivery_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const addr = isStore ? "Direct Store Sale" : `${cust.name}, 123 Main Street`;
    const city = isStore ? "Store" : cust.city;
    const pin = isStore ? "000000" : cust.pincode;
    const phone = isStore ? "9999900000" : cust.phone;

    await new Promise((res) => db.query(sqlShip, [orderId, addr, city, saleState, pin, phone, spec.date, spec.date, spec.date], (e, r) => res(r)));
  }

  console.log(`✅ Successfully populated ${testOrderSpecs.length} test orders covering ALL FOUR HSN CODES (7117, 7323, 9615, 4202) across Jan, Feb, Mar 2026!`);
  process.exit(0);
}

populateTestOrders();
