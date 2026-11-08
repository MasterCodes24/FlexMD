import { generateStructuredJson } from "../geminiClient.js";
import { DAILY_SUMMARY_SCHEMA } from "../schemas.js";
import { DAILY_SUMMARY_SYSTEM_INSTRUCTION, buildDailySummaryUserPrompt } from "../prompts.js";

/**
 * Generates an operational daily briefing for the doctor's dashboard.
 * 
 * @param {Object} metrics
 * @param {number} metrics.patientCount - Patients seen today
 * @param {number} metrics.totalRevenue - Total revenue collected in INR
 * @param {number} metrics.cashCollected - Cash amount collected
 * @param {number} metrics.onlineCollected - UPI/online amount collected
 * @param {string[]} [metrics.lowStockItems] - Names of low stock medicines
 * @returns {Promise<Object>}
 */
export async function generateDailySummary(metrics) {
  const patientCount = Number(metrics.patientCount) || 0;
  const cashCollected = Number(metrics.cashCollected) || 0;
  const onlineCollected = Number(metrics.onlineCollected) || 0;
  const totalRevenue = Number(metrics.totalRevenue) || (cashCollected + onlineCollected);
  const lowStockItems = Array.isArray(metrics.lowStockItems) ? metrics.lowStockItems : [];

  const userPrompt = buildDailySummaryUserPrompt({
    patientCount,
    totalRevenue,
    cashCollected,
    onlineCollected,
    lowStockItems
  });

  try {
    const result = await generateStructuredJson({
      systemInstruction: DAILY_SUMMARY_SYSTEM_INSTRUCTION,
      userPrompt,
      jsonSchema: DAILY_SUMMARY_SCHEMA
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
    console.error("[ClinicFlow AI] Daily Summary Error:", error.message);
    
    // Deterministic fallback if API fails
    const stockNote = lowStockItems.length > 0 
      ? ` Note: ${lowStockItems.join(", ")} below reorder level.` 
      : "";
    return {
      success: false,
      error: error.message,
      data: {
        briefing: `Today, the clinic saw ${patientCount} patients and collected ₹${totalRevenue.toLocaleString("en-IN")}: ₹${cashCollected.toLocaleString("en-IN")} cash and ₹${onlineCollected.toLocaleString("en-IN")} online.${stockNote}`,
        total_patients: patientCount,
        total_revenue: totalRevenue,
        cash_collected: cashCollected,
        online_collected: onlineCollected,
        inventory_alert: lowStockItems.length > 0 ? lowStockItems.join(", ") : null
      }
    };
  }
}

