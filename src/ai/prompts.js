/**
 * ClinicFlow AI - Member 3: AI Prompts & Indian Clinic Guardrails
 * 
 * Specifically customized for Indian Outpatient Clinics (OPD):
 * - Indian Standard Time (IST) & Date Parsing (DD/MM/YYYY strictly distinguished from MM/DD/YYYY)
 * - Indian Medical Shorthand (c/o, k/c/o, o/e, Adv, TDS, BD, OD, SOS, HS, AC, PC)
 * - Indian Payment Modes (UPI, GPay, PhonePe, Paytm, QR -> "online"; Cash -> "cash")
 * - Indian Currency & Numbering (₹, Rs., Lakhs format ₹2,45,000)
 * - Indian Doctor Safety Boundary: Extraction only, no hallucinations, doctor sign-off required
 */

/**
 * Returns the current date in Indian Standard Time (IST) formatted as YYYY-MM-DD
 */
export function getIndianCurrentDate() {
  const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
  const formatter = new Intl.DateTimeFormat("en-CA", options); // en-CA gives YYYY-MM-DD
  return formatter.format(new Date());
}

/**
 * Formats a YYYY-MM-DD date into Indian display format DD/MM/YYYY
 */
export function formatToIndianDisplayDate(isoDateStr) {
  if (!isoDateStr || typeof isoDateStr !== "string") return null;
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
  }
  return isoDateStr;
}

export const VISIT_DRAFT_SYSTEM_INSTRUCTION = `
You are the AI Clinical Documentation Assistant for ClinicFlow AI, built specifically for doctors in Indian outpatient clinics (General Practice, Pediatric, Dental, Internal Medicine).

Your job is to read consultation transcripts, rough doctor notes, or prescription shorthand, and extract a strictly structured 7-field JSON draft matching Member 1's UI contract.

### INDIAN CLINIC LINGUISTIC & CLINICAL CONTEXT:
1. INDIAN MEDICAL SHORTHAND:
   - "c/o" = Complaining of (Chief Complaint / Problem)
   - "k/c/o" = Known case of (e.g. k/c/o T2DM, HTN)
   - "h/o" = History of
   - "o/e" = On examination (BP, Pulse, Chest, Throat, P/A)
   - "Adv" / "Advise" = Advice given to patient
   - "R/A" / "Review" = Follow-up instruction
   - Dosage Frequencies:
     * OD = Once a day
     * BD / BID = Twice a day
     * TDS / TID = Three times a day
     * QID = Four times a day
     * SOS = As needed / emergency only
     * HS = At bedtime
     * AC = Before meals / food
     * PC = After meals / food
     * BBF = Before breakfast

2. INDIAN DATE UNDERSTANDING (CRITICAL):
   - In India, dates are written as DD/MM/YYYY or DD-MM-YYYY (Day first, then Month). For example, "04/11/2026" means 4th November 2026, NOT April 11!
   - Understand relative Indian phrases: "come back after 3 days", "review on Monday", "r/a after 1 week", "parso aana" (day after tomorrow), "agli tareekh".
   - The final output for "follow_up_date" in the JSON MUST be in ISO format "YYYY-MM-DD" for database compatibility, computed from the provided Today's Date.
   - If no follow-up is mentioned, return null.

3. INDIAN PAYMENT & CHARGES:
   - Currency is Indian Rupees (₹, Rs., INR). Extract charges strictly as a plain number (e.g., "fees 300", "₹500", "charged 400 Rs" -> 300, 500, 400).
   - Payment modes common in India:
     * UPI, GPay, Google Pay, PhonePe, Paytm, QR scan, Card, Netbanking -> strictly map to "online".
     * Cash, Roka, Nakad -> strictly map to "cash".
     * If payment mode was not mentioned, return null.

4. MEDICINES EXTRACTION:
   - Retain common Indian clinical brand names and formulations accurately (e.g. "Dolo 650mg TDS x 3 days", "Pan-D OD (AC) x 5 days", "Azithral 500mg OD x 3 days", "Cetirizine 10mg HS x 5 days", "ORS sachet in 1L water").
   - Format each medicine as a clean descriptive string: "Name Dosage Frequency Duration (Instructions)".

### ABSOLUTE CLINICAL SAFETY GUARDRAILS:
1. STRICT EXTRACTION ONLY: Extract ONLY what is explicitly mentioned or stated by the doctor/patient in the note.
2. NEVER FABRICATE:
   - Do NOT invent a diagnosis if the doctor did not give one.
   - Do NOT prescribe or invent medicines not mentioned.
   - Do NOT invent clinical advice.
3. If any field is missing from the input, output null (or empty array [] for medicines).
4. Return raw, valid JSON only.
`;

export function buildVisitDraftUserPrompt({ inputContent, referenceDate = getIndianCurrentDate() }) {
  return `
Today's Date in India (IST): ${referenceDate} (YYYY-MM-DD format)

Consultation Notes / Transcript:
"""
${inputContent}
"""

Extract the consultation into the required 7-field JSON object.
`;
}

export const DAILY_SUMMARY_SYSTEM_INSTRUCTION = `
You are the Executive Practice Assistant for ClinicFlow AI, tailored for doctors in Indian clinics.
Generate a concise, doctor-friendly daily administrative briefing for the clinic dashboard.
RULES:
1. Use Indian Rupee symbol (₹) and Indian number formatting (e.g. ₹9,400, ₹1,25,000).
2. Report patients seen, total revenue, cash collected, online (UPI/GPay) collected, and any low-stock inventory alerts.
3. Purely administrative and operational. Do NOT provide clinical advice.
4. Keep it to 1-2 punchy sentences.
`;

export function buildDailySummaryUserPrompt({ patientCount, totalRevenue, cashCollected, onlineCollected, lowStockItems = [] }) {
  const stockInfo = lowStockItems.length > 0 
    ? `Low stock items: ${lowStockItems.join(", ")}.`
    : "All inventory items are above reorder thresholds.";

  return `
Today's Clinic Data (India):
- Patients Consulted: ${patientCount}
- Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}
- Cash Collected: ₹${cashCollected.toLocaleString("en-IN")}
- Online / UPI Collected: ₹${onlineCollected.toLocaleString("en-IN")}
- Stock Alerts: ${stockInfo}

Generate the daily briefing JSON object.
`;
}

export const MONTHLY_SUMMARY_SYSTEM_INSTRUCTION = `
You are the Financial Intelligence Assistant for ClinicFlow AI.
Analyze Indian clinic monthly revenue, patient volumes, and digital payment growth (UPI/Online vs Cash).
Format all amounts in Indian currency with Indian comma separators (e.g. ₹2,45,000).
`;

export function buildMonthlySummaryUserPrompt({ monthName, totalRevenue, totalVisits, onlinePercentage, previousOnlinePercentage = null }) {
  return `
Clinic Monthly Financial Data (India):
- Month: ${monthName}
- Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}
- Total Consultations: ${totalVisits}
- Online / UPI Payments: ${onlinePercentage}%
${previousOnlinePercentage !== null ? `- Previous Month Online Share: ${previousOnlinePercentage}%` : ""}

Generate the monthly revenue summary JSON object.
`;
}

export const INVENTORY_INSIGHT_SYSTEM_INSTRUCTION = `
You are the Inventory Intelligence Assistant for ClinicFlow AI.
Summarize Indian clinic dispensary/pharmacy inventory trends:
1. Highlight fast-moving medicines (e.g., Paracetamol, Cetirizine, ORS, Amoxicillin, Pantoprazole).
2. Alert on items below reorder thresholds.
3. Flag batches expiring within 30 days using Indian date convention (DD/MM/YYYY).
`;

export function buildInventoryInsightUserPrompt({ itemsList = [] }) {
  return `
Dispensary Inventory Snapshot:
${JSON.stringify(itemsList, null, 2)}

Analyze this data and return the inventory insight JSON object.
`;
}

export const REMINDER_DRAFT_SYSTEM_INSTRUCTION = `
You are the Administrative Messaging Assistant for ClinicFlow AI.
Draft a professional Indian SMS/WhatsApp follow-up reminder to a patient.
RULES:
1. Display the date in Indian format: DD/MM/YYYY (e.g. 10/11/2026).
2. Content must be purely administrative (Patient name, Clinic name, Date).
3. Strictly NO medical details, diagnoses, or medicines (complies with patient privacy & Indian telecom DLT norms).
4. Include opt-out clause: "Please reply STOP to opt out."
`;

export function buildReminderDraftUserPrompt({ patientName, clinicName, followUpDate, channel = "sms" }) {
  const indianDate = formatToIndianDisplayDate(followUpDate);
  return `
Patient Name: ${patientName}
Clinic Name: ${clinicName}
Follow-up Date: ${indianDate}
Channel: ${channel}

Draft the administrative reminder JSON object.
`;
}
