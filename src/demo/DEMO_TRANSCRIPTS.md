# ClinicFlow AI - Live Pitch Demo Transcripts

Use these realistic Indian clinic transcripts during your hackathon presentation and rehearsal. They demonstrate rapid transcription, Indian clinical terminology understanding, and 100% adherence to Member 1's 7-field UI.

---

## 🎯 Demo 1: The Primary 3-Minute Pitch (Acute Viral Fever OPD)

### Input to Paste in "AI Draft Notes" Box:
```text
Patient: Ramesh Kumar, 32-year-old male.
c/o high fever with chills for 2 days, body ache, throat irritation.
o/e: Temp 102°F, pulse 88/min, chest clear bilaterally, pharynx congested.
Diagnosis: Acute Viral Pharyngitis.
Prescription:
1. Tab Dolo 650mg TDS x 3 days (after food)
2. Tab Cetirizine 10mg HS x 5 days
3. Cap Pan-D OD (BBF) x 3 days
Advise: Drink warm water, strict bed rest, light home-cooked food. Avoid cold beverages.
Fees: ₹300 collected in cash.
Review: Come back after 3 days if fever does not subside.
```

### Expected 7-Field AI Output in Member 1's UI:
* **problem**: `"high fever with chills for 2 days, body ache, throat irritation"`
* **diagnosis_or_solution**: `"Acute Viral Pharyngitis"`
* **medicines**:
  * `"Tab Dolo 650mg TDS x 3 days (after food)"`
  * `"Tab Cetirizine 10mg HS x 5 days"`
  * `"Cap Pan-D OD (BBF) x 3 days"`
* **advice**: `"Drink warm water, strict bed rest, light home-cooked food. Avoid cold beverages."`
* **charges**: `300`
* **payment_mode**: `"cash"`
* **follow_up_date**: `2026-11-11` (Calculated exactly 3 days from today in IST)

---

## 🎯 Demo 2: Chronic Follow-Up with UPI / GPay & Indian Date

### Input to Paste in "AI Draft Notes" Box:
```text
Mrs. Sunita Verma, 54F. Follow up k/c/o Type 2 Diabetes Mellitus & HTN.
BP 130/80 mmHg, FBS 124 mg/dL.
Solution: Well controlled on current regimen.
Medicines: Continue Tab Metformin 500mg BD (PC) & Tab Telmisartan 40mg OD.
Advice: 45 minutes brisk morning walk, avoid sweets, reduce white rice and fried snacks.
Consultation charge ₹500 received via GPay QR code.
Next follow up date: 10/12/2026 for routine 3-month HbA1c review.
```

### Expected 7-Field AI Output in Member 1's UI:
* **problem**: `"Follow up k/c/o Type 2 Diabetes Mellitus & HTN"`
* **diagnosis_or_solution**: `"Well controlled on current regimen"`
* **medicines**:
  * `"Tab Metformin 500mg BD (PC)"`
  * `"Tab Telmisartan 40mg OD"`
* **advice**: `"45 minutes brisk morning walk, avoid sweets, reduce white rice and fried snacks."`
* **charges**: `500`
* **payment_mode**: `"online"`
* **follow_up_date**: `2026-12-10` (Accurately parsed from Indian DD/MM/YYYY!)

---

## 🎯 Demo 3: Doctor Shorthand with Missing Fields (Safety & Null Test)

### Input to Paste in "AI Draft Notes" Box:
```text
Child Aarav, 5 yrs.
c/o nocturnal dry cough x 3 days.
Dx: Allergic Bronchospasm.
Rx: Syp Ascoril-LS 5ml TDS x 5 days.
Adv: Steam inhalation bedtime, avoid dust.
Fees: ₹400 paid via PhonePe.
```

### Expected 7-Field AI Output:
* **problem**: `"nocturnal dry cough x 3 days"`
* **diagnosis_or_solution**: `"Allergic Bronchospasm"`
* **medicines**: `["Syp Ascoril-LS 5ml TDS x 5 days"]`
* **advice**: `"Steam inhalation bedtime, avoid dust."`
* **charges**: `400`
* **payment_mode**: `"online"`
* **follow_up_date**: `null` (Safety guardrail: no invented dates!)

---

## 🎯 Demo 4: Dashboard Operational Briefing

### Input Data for Dashboard:
* Patients Seen Today: `18`
* Total Revenue: `₹9,400`
* Cash Collected: `₹6,200`
* Online (UPI) Collected: `₹3,200`
* Low Stock Alert: `Paracetamol 500mg (12 strips left)`

### AI Generated Briefing:
> *"Today, the clinic saw 18 patients and collected ₹9,400: ₹6,200 cash and ₹3,200 online. Paracetamol 500mg is below the reorder level."*

