import { generateStructuredJson } from "../geminiClient.js";
import { REMINDER_DRAFT_SCHEMA } from "../schemas.js";
import { 
  REMINDER_DRAFT_SYSTEM_INSTRUCTION, 
  buildReminderDraftUserPrompt, 
  formatToIndianDisplayDate 
} from "../prompts.js";

/**
 * Drafts an administrative follow-up reminder compliant with Indian DLT and privacy norms.
 * Strictly no clinical diagnoses or medicines are included in the message.
 * 
 * @param {Object} params
 * @param {string} params.patientName
 * @param {string} params.clinicName
 * @param {string} params.followUpDate - ISO YYYY-MM-DD or DD/MM/YYYY
 * @param {string} [params.channel] - "sms" or "whatsapp"
 * @returns {Promise<Object>}
 */
export async function draftFollowUpReminder({ patientName, clinicName, followUpDate, channel = "sms" }) {
  const pName = patientName || "Patient";
  const cName = clinicName || "Your Clinic";
  const formattedDate = formatToIndianDisplayDate(followUpDate) || followUpDate;

  const userPrompt = buildReminderDraftUserPrompt({
    patientName: pName,
    clinicName: cName,
    followUpDate: formattedDate,
    channel
  });

  try {
    const result = await generateStructuredJson({
      systemInstruction: REMINDER_DRAFT_SYSTEM_INSTRUCTION,
      userPrompt,
      jsonSchema: REMINDER_DRAFT_SCHEMA
    });

    return {
      success: true,
      data: result,
      metadata: {
        is_administrative_only: true,
        channel,
        formatted_date_indian: formattedDate
      }
    };
  } catch (error) {
    console.error("[ClinicFlow AI] Reminder Draft Error:", error.message);
    
    // Compliant deterministic fallback
    return {
      success: false,
      error: error.message,
      data: {
        message_text: `Hello ${pName}, this is a reminder from ${cName} regarding your follow-up on ${formattedDate}. Built for doctors: AI assists; doctor decides. Please reply STOP to opt out.`,
        channel
      },
      metadata: {
        is_administrative_only: true,
        channel,
        formatted_date_indian: formattedDate,
        fallback: true
      }
    };
  }
}

