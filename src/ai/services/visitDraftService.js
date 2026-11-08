import { generateStructuredJson } from "../geminiClient.js";
import { VISIT_DRAFT_SCHEMA } from "../schemas.js";
import { 
  VISIT_DRAFT_SYSTEM_INSTRUCTION, 
  buildVisitDraftUserPrompt, 
  getIndianCurrentDate 
} from "../prompts.js";

/**
 * Empty fallback template matching Member 1's 7-field schema
 */
export const EMPTY_VISIT_DRAFT = {
  problem: null,
  diagnosis_or_solution: null,
  medicines: [],
  advice: null,
  charges: null,
  payment_mode: null,
  follow_up_date: null
};

/**
 * Extracts consultation notes into Member 1's 7-field schema.
 * Supports typed notes, pasted consultation transcripts, or recorded audio!
 * 
 * @param {Object} params
 * @param {string} [params.inputContent] - Doctor's typed notes, prescription shorthand, or transcript
 * @param {Object} [params.audio] - Optional audio object { base64: string, mimeType: string }
 * @param {string} [params.referenceDate] - ISO date YYYY-MM-DD (defaults to today in IST)
 * @returns {Promise<Object>} Object with 7 fields + safety metadata
 */
export async function draftVisitFromNotes({ inputContent = "", audio = null, referenceDate = null }) {
  const hasAudio = audio && audio.base64;
  const hasText = inputContent && typeof inputContent === "string" && inputContent.trim().length > 0;

  if (!hasText && !hasAudio) {
    return {
      success: true,
      data: { ...EMPTY_VISIT_DRAFT },
      metadata: {
        is_ai_draft: true,
        disclaimer: "AI draft — doctor review required. Built for doctors: AI assists; doctor decides.",
        note: "Empty input provided; returned blank draft."
      }
    };
  }

  const todayIst = referenceDate || getIndianCurrentDate();
  const promptText = hasText ? inputContent.trim() : "Audio consultation recording provided. Transcribe and extract all clinical consultation fields.";
  const userPrompt = buildVisitDraftUserPrompt({ 
    inputContent: promptText, 
    referenceDate: todayIst 
  });

  try {
    const rawResult = await generateStructuredJson({
      systemInstruction: VISIT_DRAFT_SYSTEM_INSTRUCTION,
      userPrompt,
      jsonSchema: VISIT_DRAFT_SCHEMA,
      audioData: hasAudio ? { base64: audio.base64, mimeType: audio.mimeType || "audio/mp3" } : null
    });

    // Ensure 100% adherence to Member 1's keys and types
    const sanitizedDraft = {
      problem: typeof rawResult.problem === "string" ? rawResult.problem.trim() : null,
      diagnosis_or_solution: typeof rawResult.diagnosis_or_solution === "string" ? rawResult.diagnosis_or_solution.trim() : null,
      medicines: Array.isArray(rawResult.medicines) ? rawResult.medicines.filter(m => typeof m === "string" && m.trim().length > 0) : [],
      advice: typeof rawResult.advice === "string" ? rawResult.advice.trim() : null,
      charges: typeof rawResult.charges === "number" && !isNaN(rawResult.charges) ? rawResult.charges : null,
      payment_mode: ["cash", "online"].includes(rawResult.payment_mode) ? rawResult.payment_mode : null,
      follow_up_date: typeof rawResult.follow_up_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawResult.follow_up_date) ? rawResult.follow_up_date : null
    };

    return {
      success: true,
      data: sanitizedDraft,
      metadata: {
        is_ai_draft: true,
        disclaimer: "AI draft — doctor review required. Built for doctors: AI assists; doctor decides.",
        source: hasAudio ? "audio_consultation" : "text_notes",
        extracted_at_ist: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        reference_date: todayIst
      }
    };
  } catch (error) {
    console.error("[ClinicFlow AI] Visit Draft Error:", error.message);
    
    // Fail-safe: Return clean empty draft so Member 1's frontend NEVER crashes
    return {
      success: false,
      error: error.message,
      data: { ...EMPTY_VISIT_DRAFT },
      metadata: {
        is_ai_draft: false,
        fallback: true,
        disclaimer: "AI extraction encountered an issue. Doctor can manually enter fields."
      }
    };
  }
}
