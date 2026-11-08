/**
 * ClinicFlow AI - Member 3: Central AI Service Module
 * 
 * Exports all AI capabilities matching Member 1 (Frontend) & Member 2 (Backend) specs:
 * 1. draftVisitFromNotes -> Strict 7-field schema
 * 2. generateDailySummary -> Dashboard briefing
 * 3. generateMonthlySummary -> Monthly revenue insight
 * 4. generateInventoryInsights -> Stock & expiry insights
 * 5. draftFollowUpReminder -> Privacy-compliant Indian SMS/WhatsApp reminder
 */

export { draftVisitFromNotes, EMPTY_VISIT_DRAFT } from "./services/visitDraftService.js";
export { generateDailySummary } from "./services/dailySummaryService.js";
export { generateMonthlySummary } from "./services/monthlySummaryService.js";
export { generateInventoryInsights } from "./services/inventoryInsightService.js";
export { draftFollowUpReminder } from "./services/reminderDraftService.js";
export { VISIT_DRAFT_SCHEMA, DAILY_SUMMARY_SCHEMA, MONTHLY_SUMMARY_SCHEMA, INVENTORY_INSIGHT_SCHEMA, REMINDER_DRAFT_SCHEMA } from "./schemas.js";
export { getIndianCurrentDate, formatToIndianDisplayDate } from "./prompts.js";

