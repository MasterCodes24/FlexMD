/**
 * ClinicFlow AI - Frontend Helper Client for Member 1
 * 
 * Drop this helper directly into your React / Next.js / Vanilla JS app.
 * Connects the Frontend AI Draft Screen directly to Member 3's AI Engine
 * and formats approved drafts for Member 2's POST /api/visits endpoint.
 */

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:5000";

/**
 * Calls Gemini AI to draft the 7 fields from doctor notes, transcripts, or audio.
 * 
 * @param {Object} options
 * @param {string} [options.notes] - Raw typed notes or consultation transcript
 * @param {string} [options.audioBase64] - Base64 encoded audio string
 * @param {string} [options.audioMimeType] - E.g. "audio/mp3", "audio/webm", "audio/wav"
 * @returns {Promise<{
 *   problem: string | null,
 *   diagnosis_or_solution: string | null,
 *   medicines: string[],
 *   advice: string | null,
 *   charges: number | null,
 *   payment_mode: 'cash' | 'online' | null,
 *   follow_up_date: string | null
 * }>}
 */
export async function getAiVisitDraft({ notes = "", audioBase64 = null, audioMimeType = "audio/webm" }) {
  const payload = {
    notes,
    audio: audioBase64 ? { base64: audioBase64, mimeType: audioMimeType } : null
  };

  const response = await fetch(`${AI_BASE_URL}/api/ai/draft-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`AI Draft Request Failed with status ${response.status}`);
  }

  const result = await response.json();
  // Returns clean 7 fields directly into your state
  return result.data;
}

/**
 * Formats the reviewed and approved AI draft for Member 2's POST /api/visits endpoint.
 * 
 * @param {string} patientId - E.g. "P-1029"
 * @param {Object} approvedDraft - The 7 editable fields from the screen
 * @returns {Object} Ready payload for Member 2
 */
export function formatForMember2SaveVisit(patientId, approvedDraft) {
  return {
    patient_id: patientId,
    problem: approvedDraft.problem || "",
    diagnosis_or_solution: approvedDraft.diagnosis_or_solution || "",
    medicines: Array.isArray(approvedDraft.medicines) ? approvedDraft.medicines : [],
    advice: approvedDraft.advice || "",
    charges: typeof approvedDraft.charges === "number" ? approvedDraft.charges : 0,
    payment_mode: approvedDraft.payment_mode || "cash",
    follow_up_date: approvedDraft.follow_up_date || null
  };
}

/**
 * Fetches the daily administrative briefing for the doctor's dashboard.
 */
export async function getDailyDashboardBriefing(metrics) {
  const response = await fetch(`${AI_BASE_URL}/api/ai/daily-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrics)
  });
  const result = await response.json();
  return result.data;
}

