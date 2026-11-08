# ClinicFlow AI - Member 3 (AI & Gemini Integration) Implementation Plan

## Executive Overview
- **Role**: Member 3 — AI, Gemini Integration, and Safety Controls
- **Product**: ClinicFlow AI (Smart clinic assistant for doctors in small Indian clinics)
- **Primary AI Objective**: Convert unstructured doctor notes, consultation transcripts, or audio into strict 7-field structured JSON for Member 1's UI, while generating daily operational briefings, monthly revenue insights, inventory intelligence, and reminder drafts.
- **Safety Boundary**: The AI **never** diagnoses, prescribes, or decides treatments. It strictly drafts administrative consultation records for the doctor to review, edit, and approve.
- **Target Context**: **Indian Outpatient (OPD) Clinics** (IST timezone, Indian date formats, Indian shorthand, UPI/GPay payments, Rupee ₹ currency).

---

## 1. Frontend & Backend Contract Alignment

### 1.1 Member 1's Exact 7-Field AI Draft UI Contract
Member 1 requires this exact JSON schema from the AI integration:
```json
{
  "problem": "string or null",
  "diagnosis_or_solution": "string or null",
  "medicines": ["array of strings", "or empty array"],
  "advice": "string or null",
  "charges": "number or null",
  "payment_mode": "string ('cash' | 'online') or null",
  "follow_up_date": "YYYY-MM-DD string or null"
}
```

### 1.2 Member 2's Saved Visit Endpoint (`POST /api/visits`)
Once the doctor reviews and approves the AI draft in Member 1's UI, the frontend will attach `patient_id` and send it to Member 2:
```json
{
  "patient_id": "P-1029",
  "problem": "Fever and body ache for 2 days",
  "diagnosis_or_solution": "Viral Pyrexia",
  "medicines": ["Paracetamol 650mg", "Cetirizine 10mg"],
  "advice": "Drink warm water, rest.",
  "charges": 300,
  "payment_mode": "cash",
  "follow_up_date": "2026-11-10"
}
```

---

## 2. Indian Clinic Customizations & Standards

### 2.1 Indian Date Conventions
- **Note Input**: Doctors write dates as `DD/MM/YYYY` or `DD-MM-YYYY` (e.g., `04/11/2026` = 4th November 2026, **never** April 11).
- **Timezone**: Indian Standard Time (`Asia/Kolkata`, IST, UTC+05:30) used as reference today.
- **Relative Date Parsing**: "come back after 3 days", "review in 1 week", "parso aana", "next Monday" $\rightarrow$ resolved to ISO `YYYY-MM-DD` for DB/UI datepicker.
- **Patient Reminders**: Formatted in Indian readable format `DD/MM/YYYY` (e.g. `10/11/2026`).

### 2.2 Indian Payment Modes & Currency
- Currency: Indian Rupee (`₹`, `Rs.`, `INR`).
- Auto-classification:
  - `UPI`, `GPay`, `Google Pay`, `PhonePe`, `Paytm`, `QR scan`, `Card`, `NetBanking` $\rightarrow$ strictly `"online"`.
  - `Cash`, `Roka`, `Nakad` $\rightarrow$ strictly `"cash"`.
- Charges: Numeric values only (`300`, `500`).

### 2.3 Indian Clinical Shorthand & Formulations
- Symptoms & History: `c/o` (complaining of), `k/c/o` (known case of), `h/o` (history of), `o/e` (on examination).
- Frequencies: `OD` (once daily), `BD` (twice daily), `TDS` (thrice daily), `SOS` (as needed), `HS` (bedtime), `AC` (before meals), `PC` (after meals), `BBF` (before breakfast).
- Indian Formulations: Dolo 650, Calpol, Pan-D, Azithral, Cetirizine, ORS, etc.

### 2.4 Indian Numbering & Summaries
- Financial amounts use Indian numbering (e.g. `₹9,400`, `₹2,45,000`).

---

## 3. Division of Responsibilities

### 3.1 What Member 3 (You) Do Manually
1. **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/) and paste it into `.env` (`GEMINI_API_KEY=...`).
2. **Team Stack Coordination**: Run `npm run start` or share the port (`http://localhost:5000`) with Member 1 & 2.
3. **Demo Pitch Delivery**: Present the 3-minute pitch emphasizing the Indian clinic context and safety boundary.

### 3.2 What the Assistant (Antigravity) Builds & Maintains
1. **Gemini Client Engine** (`src/ai/geminiClient.js`): Structured JSON outputs (`responseSchema`) with low-temperature extraction.
2. **Prompts & Guardrails** (`src/ai/prompts.js`): Strict anti-hallucination instructions and Indian clinical rules.
3. **5 Dedicated AI Services** (`src/ai/services/`):
   - `visitDraftService.js`: 7-field consultation extraction.
   - `dailySummaryService.js`: Operational briefing for the doctor's dashboard.
   - `monthlySummaryService.js`: Monthly revenue insight with UPI shift.
   - `inventoryInsightService.js`: Low-stock and fast-moving medicine insight.
   - `reminderDraftService.js`: Administrative, DLT-compliant SMS reminder.
4. **Standalone REST Server** (`src/server.js`): Zero-dependency Node server with CORS enabled on port 5000 for instant Member 1 integration.
5. **Interactive Test Suite** (`src/ai/test-ai-runner.js`): CLI runner to test realistic Indian clinic scenarios.

---

## 4. API Endpoints Provided by Member 3

| Endpoint | Method | Input Payload | Output Format |
|---|---|---|---|
| `/api/ai/draft-visit` | `POST` | `{ "notes": "transcript or text" }` | `{ success: true, data: { problem, diagnosis_or_solution, medicines, advice, charges, payment_mode, follow_up_date }, metadata: {...} }` |
| `/api/ai/daily-summary` | `POST` | `{ "patientCount": 18, "cashCollected": 6200, "onlineCollected": 3200, "lowStockItems": [...] }` | `{ success: true, data: { briefing, total_patients, total_revenue, cash_collected, online_collected } }` |
| `/api/ai/monthly-summary` | `POST` | `{ "monthName": "October", "totalRevenue": 245000, "totalVisits": 386, "onlinePercentage": 41 }` | `{ success: true, data: { summary_text, online_share_percentage, trend_observation } }` |
| `/api/ai/inventory-insights` | `POST` | `{ "items": [...] }` | `{ success: true, data: { insight_text, items_to_reorder, batches_expiring_soon } }` |
| `/api/ai/draft-reminder` | `POST` | `{ "patientName": "Ramesh", "clinicName": "ClinicFlow", "followUpDate": "2026-11-10", "channel": "sms" }` | `{ success: true, data: { message_text, channel } }` |

---

## 5. Hackathon 3-Minute AI Pitch Script (Indian Clinic Focus)

> *"In busy Indian OPD clinics, doctors see 30 to 50 patients a day and spend over two hours manually writing prescriptions, receipts, and follow-up slips. ClinicFlow AI eliminates this paperwork burden without interfering with clinical judgment.*
> 
> *Our AI is designed specifically for Indian doctors: it natively understands Indian clinical shorthand like c/o, k/c/o, TDS, Pan-D, and Dolo 650. It maps UPI and GPay payments, computes Indian follow-up dates, and enforces strict extraction-only guardrails.*
> 
> *The AI never makes medical decisions. It produces an unapproved draft for Member 1's 7-field screen. The doctor reviews it, modifies any field in one second, and approves it to update revenue and patient history instantly.*
> 
> *ClinicFlow AI: Built for Indian doctors. AI assists; the doctor decides."*
