import db from "../config/db.js";
import ExcelJS from "exceljs";

// Helper to calculate date range based on periodType ("Monthly" / "Quarterly") and periodValue
const calculateDateRange = (periodType, financialYear, periodValue) => {
  const fy = financialYear || "2025-2026";
  const [startYearStr, endYearStr] = fy.split("-");
  const startYear = parseInt(startYearStr, 10) || 2025;
  const endYear = parseInt(endYearStr, 10) || 2026;

  let startDate = `${startYear}-04-01 00:00:00`;
  let endDate = `${endYear}-03-31 23:59:59`;

  if (periodType === "Monthly" && periodValue) {
    // periodValue format e.g. "2025-04" or "2026-03"
    const parts = periodValue.split("-");
    if (parts.length === 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const lastDay = new Date(y, m, 0).getDate();
      const mStr = String(m).padStart(2, "0");
      startDate = `${y}-${mStr}-01 00:00:00`;
      endDate = `${y}-${mStr}-${lastDay} 23:59:59`;
    }
  } else if (periodType === "Quarterly" && periodValue) {
    if (periodValue === "Q1") {
      startDate = `${startYear}-04-01 00:00:00`;
      endDate = `${startYear}-06-30 23:59:59`;
    } else if (periodValue === "Q2") {
      startDate = `${startYear}-07-01 00:00:00`;
      endDate = `${startYear}-09-30 23:59:59`;
    } else if (periodValue === "Q3") {
      startDate = `${startYear}-10-01 00:00:00`;
      endDate = `${startYear}-12-31 23:59:59`;
    } else if (periodValue === "Q4") {
      startDate = `${endYear}-01-01 00:00:00`;
      endDate = `${endYear}-03-31 23:59:59`;
    }
  }

  return { startDate, endDate };
};

// =========================================================================
// 1. GST READY REPORT (Tab 1: B2CS, Tab 2: HSN Summary)
// =========================================================================
export const downloadGstReadyReport = (req, res) => {
  const { periodType, financialYear, periodValue } = req.query;
  const { startDate, endDate } = calculateDateRange(periodType, financialYear, periodValue);

  // Fetch Business State default and format as GST State (e.g. 33-TAMIL NADU)
  db.query("SELECT `value` FROM settings WHERE `key` = 'business_state'", (errSettings, sRows) => {
    const bizState = (sRows && sRows.length > 0 && sRows[0].value) ? sRows[0].value.trim() : "Tamil Nadu";

    db.query("SELECT gst_state FROM gst_states WHERE LOWER(state_name) = LOWER(?) OR LOWER(gst_state) = LOWER(?) LIMIT 1", [bizState, bizState], (errBizGst, bizGstRows) => {
      const defaultGstState = (bizGstRows && bizGstRows.length > 0 && bizGstRows[0].gst_state) ? bizGstRows[0].gst_state : "33-TAMIL NADU";

      // Query 1: B2CS Data - Place of Supply is always GST State format (e.g. 30-GOA, 01-JAMMU AND KASHMIR)
      const sqlB2CS = `
        SELECT 
          'OE' AS type,
          COALESCE(
            NULLIF(TRIM(s.gst_state), ''),
            (SELECT gs.gst_state FROM gst_states gs WHERE LOWER(TRIM(gs.state_name)) = LOWER(TRIM(s.state)) OR LOWER(TRIM(gs.gst_state)) = LOWER(TRIM(s.state)) OR TRIM(gs.state_code) = TRIM(s.state_code) LIMIT 1),
            ?
          ) AS place_of_supply,
          oi.gst_rate,
          ROUND(SUM(oi.taxable_amount), 2) AS total_taxable_value,
          0.00 AS cess_amount,
          '' AS ecommerce_gstin
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN shipping_details s ON s.order_id = o.id
        WHERE o.order_status IN ('paid', 'processing', 'shipped', 'delivered')
          AND o.created_at >= ? AND o.created_at <= ?
        GROUP BY place_of_supply, oi.gst_rate
        ORDER BY place_of_supply, oi.gst_rate;
      `;

      db.query(sqlB2CS, [defaultGstState, startDate, endDate], (errB2CS, b2csRows) => {
      if (errB2CS) {
        console.error("Error fetching B2CS report data:", errB2CS);
        return res.status(500).json({ message: "Database error" });
      }

      // Query 2: HSN Summary Data
      const sqlHSN = `
        SELECT 
          COALESCE(h.hsn_code, ph.hsn_code, 'OTHERS') AS hsn,
          COALESCE(h.hsn_name, ph.hsn_name, cat.name, 'General Goods') AS description,
          'NOS-NUMBERS' AS uqc,
          SUM(oi.quantity) AS total_quantity,
          ROUND(SUM(oi.price * oi.quantity), 2) AS total_value,
          oi.gst_rate AS rate,
          ROUND(SUM(oi.taxable_amount), 2) AS taxable_value,
          ROUND(SUM(oi.igst_amount), 2) AS integrated_tax,
          ROUND(SUM(oi.cgst_amount), 2) AS central_tax,
          ROUND(SUM(oi.sgst_amount), 2) AS state_tax,
          0.00 AS cess_amount
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories cat ON cat.id = p.category_id
        LEFT JOIN hsn_codes h ON h.id = cat.hsn_id
        LEFT JOIN categories pc ON pc.id = cat.parent_id
        LEFT JOIN hsn_codes ph ON ph.id = pc.hsn_id
        WHERE o.order_status IN ('paid', 'processing', 'shipped', 'delivered')
          AND o.created_at >= ? AND o.created_at <= ?
        GROUP BY hsn, description, rate
        ORDER BY hsn, rate;
      `;

      db.query(sqlHSN, [startDate, endDate], async (errHSN, hsnRows) => {
        if (errHSN) {
          console.error("Error fetching HSN report data:", errHSN);
          return res.status(500).json({ message: "Database error" });
        }

        try {
          const workbook = new ExcelJS.Workbook();
          workbook.creator = "Tivaa E-Commerce GST Engine";
          workbook.created = new Date();

          // SHEET 1: b2cs
          const sheetB2CS = workbook.addWorksheet("b2cs");
          sheetB2CS.columns = [
            { header: "Type", key: "type", width: 12 },
            { header: "Place Of Supply", key: "place_of_supply", width: 25 },
            { header: "Applicable % of Tax Rate", key: "tax_rate", width: 24 },
            { header: "Rate", key: "gst_rate", width: 12 },
            { header: "Taxable Value", key: "total_taxable_value", width: 18 },
            { header: "Cess Amount", key: "cess_amount", width: 15 },
            { header: "E-Commerce GSTIN", key: "ecommerce_gstin", width: 20 },
          ];

          // Format Header Row
          const headerRowB2CS = sheetB2CS.getRow(1);
          headerRowB2CS.font = { bold: true, color: { argb: "FFFFFFFF" } };
          headerRowB2CS.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1E293B" },
          };

          (b2csRows || []).forEach((row) => {
            sheetB2CS.addRow({
              type: row.type,
              place_of_supply: row.place_of_supply,
              tax_rate: row.gst_rate ? `${row.gst_rate}%` : "0%",
              gst_rate: Number(row.gst_rate || 0),
              total_taxable_value: Number(row.total_taxable_value || 0),
              cess_amount: 0.0,
              ecommerce_gstin: "",
            });
          });

          // SHEET 2: hsn(b2c)
          const sheetHSN = workbook.addWorksheet("hsn(b2c)");
          sheetHSN.columns = [
            { header: "HSN", key: "hsn", width: 15 },
            { header: "Description", key: "description", width: 30 },
            { header: "UQC", key: "uqc", width: 18 },
            { header: "Total Quantity", key: "total_quantity", width: 16 },
            { header: "Total Value", key: "total_value", width: 16 },
            { header: "Rate", key: "rate", width: 12 },
            { header: "Taxable Value", key: "taxable_value", width: 18 },
            { header: "Integrated Tax Amount", key: "integrated_tax", width: 22 },
            { header: "Central Tax Amount", key: "central_tax", width: 20 },
            { header: "State/UT Tax Amount", key: "state_tax", width: 20 },
            { header: "Cess Amount", key: "cess_amount", width: 15 },
          ];

          const headerRowHSN = sheetHSN.getRow(1);
          headerRowHSN.font = { bold: true, color: { argb: "FFFFFFFF" } };
          headerRowHSN.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1E293B" },
          };

          (hsnRows || []).forEach((row) => {
            sheetHSN.addRow({
              hsn: row.hsn,
              description: row.description,
              uqc: row.uqc,
              total_quantity: Number(row.total_quantity || 0),
              total_value: Number(row.total_value || 0),
              rate: Number(row.rate || 0),
              taxable_value: Number(row.taxable_value || 0),
              integrated_tax: Number(row.integrated_tax || 0),
              central_tax: Number(row.central_tax || 0),
              state_tax: Number(row.state_tax || 0),
              cess_amount: 0.0,
            });
          });

          const fileName = `GST_Ready_Report_${periodValue || "FY2025-2026"}.xlsx`;
          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

          await workbook.xlsx.write(res);
          res.end();
        } catch (excelErr) {
          console.error("Error generating GST Ready excel file:", excelErr);
          return res.status(500).json({ message: "Excel generation error" });
        }
      });
    });
  });
});
};

// =========================================================================
// 2. ORDER SALES REPORT (Order Level Report)
// =========================================================================
export const downloadOrderReport = (req, res) => {
  const { periodType, financialYear, periodValue } = req.query;
  const { startDate, endDate } = calculateDateRange(periodType, financialYear, periodValue);

  const sql = `
    SELECT 
      o.id AS order_id,
      CONCAT('#TV', DATE_FORMAT(o.created_at, '%y%m%d'), LPAD(o.id, 3, '0')) AS order_number,
      DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i') AS invoice_date,
      o.order_type,
      o.order_status,
      COALESCE(MAX(u.name), 'Guest Customer') AS customer_name,
      COALESCE(MAX(u.email), 'guest-store-sale@tivaa.in') AS customer_email,
      COALESCE(MAX(s.phone), MAX(u.phone), 'N/A') AS customer_phone,
      COALESCE(MAX(s.address), 'Direct Store Sale') AS shipping_address,
      COALESCE(MAX(s.city), 'Store') AS city,
      COALESCE(MAX(s.state), (SELECT COALESCE(value, 'Tamil Nadu') FROM settings WHERE \`key\` = 'business_state' LIMIT 1)) AS state,
      COALESCE(MAX(s.pincode), '000000') AS pincode,
      COALESCE(SUM(oi.taxable_amount), 0.00) AS taxable_value,
      COALESCE(SUM(oi.cgst_amount), 0.00) AS total_cgst,
      COALESCE(SUM(oi.sgst_amount), 0.00) AS total_sgst,
      COALESCE(SUM(oi.igst_amount), 0.00) AS total_igst,
      COALESCE(o.shipping_cost, 0.00) AS shipping_cost,
      o.total AS grand_total,
      o.payment_method,
      COALESCE(o.razorpay_order_id, MAX(pmt.payment_reference), 'N/A') AS payment_ref,
      DATE_FORMAT(MAX(s.shipped_date), '%Y-%m-%d %H:%i') AS shipped_date,
      DATE_FORMAT(MAX(s.delivery_date), '%Y-%m-%d %H:%i') AS delivery_date
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN shipping_details s ON s.order_id = o.id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN payments pmt ON pmt.order_id = o.id
    WHERE o.created_at >= ? AND o.created_at <= ?
    GROUP BY o.id, o.created_at, o.order_type, o.order_status, o.shipping_cost, o.total, o.payment_method, o.razorpay_order_id
    ORDER BY o.id DESC;
  `;

  db.query(sql, [startDate, endDate], async (err, rows) => {
    if (err) {
      console.error("Error fetching Order Sales Report:", err);
      return res.status(500).json({ message: "Database error" });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Tivaa E-Commerce GST Engine";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Order Sales Report");
      sheet.columns = [
        { header: "Order / Invoice No", key: "order_number", width: 20 },
        { header: "Invoice Date", key: "invoice_date", width: 18 },
        { header: "Order Type", key: "order_type", width: 14 },
        { header: "Order Status", key: "order_status", width: 14 },
        { header: "Customer Name", key: "customer_name", width: 22 },
        { header: "Customer Email", key: "customer_email", width: 25 },
        { header: "Customer Phone", key: "customer_phone", width: 16 },
        { header: "Shipping Address", key: "shipping_address", width: 30 },
        { header: "City", key: "city", width: 16 },
        { header: "State / Place of Supply", key: "state", width: 22 },
        { header: "Pincode", key: "pincode", width: 12 },
        { header: "Subtotal (Taxable Value)", key: "taxable_value", width: 22 },
        { header: "Total CGST", key: "total_cgst", width: 15 },
        { header: "Total SGST", key: "total_sgst", width: 15 },
        { header: "Total IGST", key: "total_igst", width: 15 },
        { header: "Shipping Charges", key: "shipping_cost", width: 18 },
        { header: "Grand Total (Invoice Total)", key: "grand_total", width: 24 },
        { header: "Payment Method", key: "payment_method", width: 16 },
        { header: "Payment Ref / Razorpay ID", key: "payment_ref", width: 25 },
        { header: "Shipped Date", key: "shipped_date", width: 18 },
        { header: "Delivered Date", key: "delivery_date", width: 18 },
      ];

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };

      (rows || []).forEach((row) => {
        sheet.addRow({
          order_number: row.order_number,
          invoice_date: row.invoice_date,
          order_type: row.order_type,
          order_status: row.order_status,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          shipping_address: row.shipping_address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          taxable_value: Number(row.taxable_value || 0),
          total_cgst: Number(row.total_cgst || 0),
          total_sgst: Number(row.total_sgst || 0),
          total_igst: Number(row.total_igst || 0),
          shipping_cost: Number(row.shipping_cost || 0),
          grand_total: Number(row.grand_total || 0),
          payment_method: row.payment_method,
          payment_ref: row.payment_ref,
          shipped_date: row.shipped_date || "",
          delivery_date: row.delivery_date || "",
        });
      });

      const fileName = `Order_Sales_Report_${periodValue || "FY2025-2026"}.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (excelErr) {
      console.error("Error generating Order Sales Report excel file:", excelErr);
      return res.status(500).json({ message: "Excel generation error" });
    }
  });
};
