import { generateStructuredJson } from "../geminiClient.js";
import { INVENTORY_INSIGHT_SCHEMA } from "../schemas.js";
import { INVENTORY_INSIGHT_SYSTEM_INSTRUCTION, buildInventoryInsightUserPrompt } from "../prompts.js";

/**
 * Generates actionable dispensary inventory insights.
 * 
 * @param {Array<Object>} itemsList - Array of inventory objects
 * @returns {Promise<Object>}
 */
export async function generateInventoryInsights(itemsList = []) {
  const userPrompt = buildInventoryInsightUserPrompt({ itemsList });

  try {
    const result = await generateStructuredJson({
      systemInstruction: INVENTORY_INSIGHT_SYSTEM_INSTRUCTION,
      userPrompt,
      jsonSchema: INVENTORY_INSIGHT_SCHEMA
    });

    return {
      success: true,
      data: result,
      metadata: {
        analyzed_items_count: itemsList.length,
        generated_at_ist: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      }
    };
  } catch (error) {
    console.error("[ClinicFlow AI] Inventory Insight Error:", error.message);
    
    // Fallback based on item list scanning
    const lowStock = itemsList
      .filter(item => item.quantity <= (item.threshold || 10))
      .map(item => item.name);

    return {
      success: false,
      error: error.message,
      data: {
        insight_text: lowStock.length > 0 
          ? `Attention required: ${lowStock.length} items are currently below reorder thresholds.`
          : "Inventory levels are stable across all categories.",
        items_to_reorder: lowStock,
        batches_expiring_soon: []
      }
    };
  }
}

