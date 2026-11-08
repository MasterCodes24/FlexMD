/**
 * ClinicFlow AI - Member 3: AI Schema Definitions
 * 
 * Strictly adheres to Member 1's UI contract for the 7 editable fields.
 */

// Member 1's required 7-field AI Draft Schema
export const VISIT_DRAFT_SCHEMA = {
  type: "object",
  properties: {
    problem: {
      type: "string",
      nullable: true,
      description: "Chief complaint or symptoms reported by the patient."
    },
    diagnosis_or_solution: {
      type: "string",
      nullable: true,
      description: "Diagnosis or clinical solution stated by the doctor."
    },
    medicines: {
      type: "array",
      items: { type: "string" },
      description: "List of prescribed/advised medicines with dosages if stated."
    },
    advice: {
      type: "string",
      nullable: true,
      description: "Dietary, lifestyle, or general care advice given to the patient."
    },
    charges: {
      type: "number",
      nullable: true,
      description: "Consultation or procedure charges as a numeric value (e.g. 300, 500)."
    },
    payment_mode: {
      type: "string",
      enum: ["cash", "online"],
      nullable: true,
      description: "Payment mode used or agreed upon: 'cash' or 'online'."
    },
    follow_up_date: {
      type: "string",
      nullable: true,
      description: "Follow-up date formatted strictly as YYYY-MM-DD, calculated from context date."
    }
  },
  required: [
    "problem",
    "diagnosis_or_solution",
    "medicines",
    "advice",
    "charges",
    "payment_mode",
    "follow_up_date"
  ]
};

// Daily Dashboard Briefing Schema
export const DAILY_SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    briefing: {
      type: "string",
      description: "Concise 1-2 sentence executive operational briefing for the doctor's dashboard."
    },
    total_patients: { type: "number" },
    total_revenue: { type: "number" },
    cash_collected: { type: "number" },
    online_collected: { type: "number" },
    inventory_alert: { type: "string", nullable: true }
  },
  required: ["briefing", "total_patients", "total_revenue", "cash_collected", "online_collected"]
};

// Monthly Revenue Insight Schema
export const MONTHLY_SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    summary_text: {
      type: "string",
      description: "High-level summary of monthly earnings, visits, and collection shifts."
    },
    online_share_percentage: { type: "number" },
    trend_observation: { type: "string" }
  },
  required: ["summary_text", "online_share_percentage", "trend_observation"]
};

// Inventory AI Insight Schema
export const INVENTORY_INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    insight_text: {
      type: "string",
      description: "Concise summary of fastest moving items, low stock warnings, and expiring batches."
    },
    items_to_reorder: {
      type: "array",
      items: { type: "string" }
    },
    batches_expiring_soon: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["insight_text", "items_to_reorder", "batches_expiring_soon"]
};

// Administrative Reminder Drafter Schema
export const REMINDER_DRAFT_SCHEMA = {
  type: "object",
  properties: {
    message_text: {
      type: "string",
      description: "Administrative follow-up reminder containing patient name, clinic name, date, and STOP opt-out. No medical details."
    },
    channel: {
      type: "string",
      enum: ["sms", "whatsapp"]
    }
  },
  required: ["message_text", "channel"]
};

