import db from "../src/config/db.js";

const OFFICIAL_GST_STATES = [
  ["01", "01-JAMMU AND KASHMIR", "JAMMU AND KASHMIR"],
  ["02", "02-HIMACHAL PRADESH", "HIMACHAL PRADESH"],
  ["03", "03-PUNJAB", "PUNJAB"],
  ["04", "04-CHANDIGARH", "CHANDIGARH"],
  ["05", "05-UTTARAKHAND", "UTTARAKHAND"],
  ["06", "06-HARYANA", "HARYANA"],
  ["07", "07-DELHI", "DELHI"],
  ["08", "08-RAJASTHAN", "RAJASTHAN"],
  ["09", "09-UTTAR PRADESH", "UTTAR PRADESH"],
  ["10", "10-BIHAR", "BIHAR"],
  ["11", "11-SIKKIM", "SIKKIM"],
  ["12", "12-ARUNACHAL PRADESH", "ARUNACHAL PRADESH"],
  ["13", "13-NAGALAND", "NAGALAND"],
  ["14", "14-MANIPUR", "MANIPUR"],
  ["15", "15-MIZORAM", "MIZORAM"],
  ["16", "16-TRIPURA", "TRIPURA"],
  ["17", "17-MEGHALAYA", "MEGHALAYA"],
  ["18", "18-ASSAM", "ASSAM"],
  ["19", "19-WEST BENGAL", "WEST BENGAL"],
  ["20", "20-JHARKHAND", "JHARKHAND"],
  ["21", "21-ODISHA", "ODISHA"],
  ["22", "22-CHHATTISGARH", "CHHATTISGARH"],
  ["23", "23-MADHYA PRADESH", "MADHYA PRADESH"],
  ["24", "24-GUJARAT", "GUJARAT"],
  ["26", "26-DADRA AND NAGAR HAVELI AND DAMAN AND DIU", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU"],
  ["27", "27-MAHARASHTRA", "MAHARASHTRA"],
  ["29", "29-KARNATAKA", "KARNATAKA"],
  ["30", "30-GOA", "GOA"],
  ["31", "31-LAKSHADWEEP", "LAKSHADWEEP"],
  ["32", "32-KERALA", "KERALA"],
  ["33", "33-TAMIL NADU", "TAMIL NADU"],
  ["34", "34-PUDUCHERRY", "PUDUCHERRY"],
  ["35", "35-ANDAMAN AND NICOBAR ISLANDS", "ANDAMAN AND NICOBAR ISLANDS"],
  ["36", "36-TELANGANA", "TELANGANA"],
  ["37", "37-ANDHRA PRADESH", "ANDHRA PRADESH"],
  ["38", "38-LADAKH", "LADAKH"],
  ["97", "97-OTHER TERRITORY", "OTHER TERRITORY"]
];

export async function seedGstStates() {
  console.log("Seeding GST States master table...");
  return new Promise((resolve, reject) => {
    // 1. Truncate / delete existing rows
    db.query("DELETE FROM gst_states", (delErr) => {
      if (delErr) {
        console.error("Error clearing existing gst_states:", delErr);
        return reject(delErr);
      }

      // 2. Insert official 37 GST states
      const insertSql = "INSERT INTO gst_states (state_code, gst_state, state_name) VALUES ?";
      db.query(insertSql, [OFFICIAL_GST_STATES], (insErr, result) => {
        if (insErr) {
          console.error("Error inserting official GST states:", insErr);
          return reject(insErr);
        }
        console.log(`Successfully seeded ${result.affectedRows} official GST States!`);
        resolve(result);
      });
    });
  });
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes("seed_gst_states.js")) {
  seedGstStates()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
