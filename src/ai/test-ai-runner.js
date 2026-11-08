import { 
  draftVisitFromNotes, 
  generateDailySummary, 
  generateMonthlySummary, 
  generateInventoryInsights, 
  draftFollowUpReminder,
  getIndianCurrentDate,
  formatToIndianDisplayDate
} from "./index.js";

async function runAllTests() {
  console.log("============================================================");
  console.log("  ClinicFlow AI - Member 3 AI Test Suite (Indian Clinic)   ");
  console.log("  Local Reference Date (IST):", getIndianCurrentDate());
  console.log("============================================================\n");

  // TEST CASE 1: Classic Indian OPD Consultation (Viral Fever)
  console.log("--- TEST 1: Viral Fever Consultation Extraction ---");
  const case1Input = `
Pt Ramesh Kumar, 32M.
c/o high fever with chills for 2 days, severe body ache, sore throat.
o/e: Temp 102 F, chest clear, pharynx congested.
Dx: Acute Viral Pharyngitis.
Rx:
1. Tab Dolo 650mg TDS x 3 days
2. Tab Cetirizine 10mg HS x 5 days
3. Cap Pan-D OD (BBF) x 3 days
Adv: Drink warm boiled water, complete bed rest, light home-cooked diet.
Fees: ₹300 collected in cash.
Review after 3 days if fever does not subside.
  `;

  const draftResult1 = await draftVisitFromNotes({ inputContent: case1Input });
  console.log("Extracted 7-Field AI Draft:");
  console.log(JSON.stringify(draftResult1.data, null, 2));
  console.log("Safety Metadata:", draftResult1.metadata);

  // Verification against Member 1's UI contract
  const keys = Object.keys(draftResult1.data);
  const requiredKeys = ["problem", "diagnosis_or_solution", "medicines", "advice", "charges", "payment_mode", "follow_up_date"];
  const matchesContract = requiredKeys.every(k => keys.includes(k));
  console.log(`\nUI Contract Verification (7 fields match): ${matchesContract ? "PASSED" : "FAILED"}`);
  console.log("------------------------------------------------------------\n");

  // TEST CASE 2: Diabetes Routine Follow-up with UPI / GPay & Indian Date
  console.log("--- TEST 2: Chronic Follow-up with UPI (GPay) & Indian Date ---");
  const case2Input = `
Mrs. Sunita, 54F. Regular follow up k/c/o Type 2 Diabetes Mellitus & Hypertension.
BP: 130/80 mmHg, FBS: 124 mg/dL.
Adv: Continue same dosage of Metformin 500mg BD. 45 mins daily brisk walk, reduce rice and sweets.
Consultation fee ₹500 received on GPay / QR code.
Next review on 10/12/2026 for HbA1c test.
  `;

  const draftResult2 = await draftVisitFromNotes({ inputContent: case2Input });
  console.log("Extracted 7-Field AI Draft:");
  console.log(JSON.stringify(draftResult2.data, null, 2));
  console.log(`Payment Mode Classified: "${draftResult2.data.payment_mode}" (Should be "online")`);
  console.log(`Follow-up Date: "${draftResult2.data.follow_up_date}" (ISO format for DB)`);
  console.log("------------------------------------------------------------\n");

  // TEST CASE 3: Daily Executive Briefing (Dashboard Snapshot)
  console.log("--- TEST 3: Dashboard Daily Summary (Indian Currency & Numbers) ---");
  const dailyResult = await generateDailySummary({
    patientCount: 18,
    totalRevenue: 9400,
    cashCollected: 6200,
    onlineCollected: 3200,
    lowStockItems: ["Paracetamol 500mg (12 strips left)", "ORS Sachet (5 left)"]
  });
  console.log("Daily Executive Briefing Result:");
  console.log(JSON.stringify(dailyResult.data, null, 2));
  console.log("------------------------------------------------------------\n");

  // TEST CASE 4: Administrative Reminder Drafter
  console.log("--- TEST 4: Follow-up Reminder Message (Indian DLT Compliant) ---");
  const reminderResult = await draftFollowUpReminder({
    patientName: "Ramesh Kumar",
    clinicName: "Shree Ganesh Clinic",
    followUpDate: draftResult1.data.follow_up_date || "2026-11-11",
    channel: "sms"
  });
  console.log("Generated Reminder Message:");
  console.log(JSON.stringify(reminderResult.data, null, 2));
  console.log("Display Date used:", reminderResult.metadata.formatted_date_indian);
  console.log("============================================================");
}

runAllTests().catch(err => {
  console.error("Test runner encountered an error:", err);
});

