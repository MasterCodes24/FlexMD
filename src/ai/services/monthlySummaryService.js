import { generateStructuredJson } from "../geminiClient.js";
import { MONTHLY_SUMMARY_SCHEMA } from "../schemas.js";
import { MONTHLY_SUMMARY_SYSTEM_INSTRUCTION, buildMonthlySummaryUserPrompt } from "../prompts.js";

/**
 * Generates monthly revenue and trend analysis.
 * 
 * @param {Object} metrics
 * @param {string} metrics.monthName - E.g. "October", "November 2026"
 * @param {number} metrics.totalRevenue - Total INR earned
 * @param {number} metrics.totalVisits - Total patient consultations
 * @param {number} metrics.onlinePercentage - Current % of online collections
 * @param {number} [metrics.previousOnlinePercentage] - Previous month's %
 * @returns {Promise<Object>}
 */
export async function generateMonthlySummary(metrics) {
  const monthName = metrics.monthName || "This Month";
  const totalRevenue = Number(metrics.totalRevenue) || 0;
  const totalVisits = Number(metrics.totalVisits) || 0;
  const onlinePercentage = Number(metrics.onlinePercentage) || 0;
  const previousOnlinePercentage = metrics.previousOnlinePercentage !== undefined ? Number(metrics.previousOnlinePercentage) : null;

  const userPrompt = buildMonthlySummaryUserPrompt({
    monthName,
    totalRevenue,
    totalVisits,
    onlinePercentage,
    previousOnlinePercentage
  });

  try {
    const result = await generateStructuredJson({
      systemInstruction: MONTHLY_SUMMARY_SYSTEM_INSTRUCTION,
      userPrompt,
      jsonSchema: MONTHLY_SUMMARY_SCHEMA
    });

    return {
      success: true,
      data: result,
      metadata: {
        currency: "INR",
        generated_at_ist: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      }
    };
  } catch (error) {
    console.error("[ClinicFlow AI] Monthly Summary Error:", error.message);
    
    // Deterministic fallback
    const shiftText = previousOnlinePercentage !== null 
      ? ` Online payments shifted from ${previousOnlinePercentage}% to ${onlinePercentage}%.` 
      : ` Online payments accounted for ${onlinePercentage}% of total collections.`;

    return {
      success: false,
      error: error.message,
      data: {
        summary_text: `In ${monthName}, the clinic earned ₹${totalRevenue.toLocaleString("en-IN")} from ${totalVisits} visits.${shiftText}`,
        online_share_percentage: onlinePercentage,
        trend_observation: "Digital adoption continues to grow via UPI/QR payments."
      }
    };
  }
}

