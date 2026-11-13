const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const clinicId = req.clinicId;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC

    // Today's visit & revenue aggregation
    const { rows: todayRows } = await pool.query(
      `SELECT
         COUNT(*)::int AS today_patients,
         COALESCE(SUM(charges), 0)::numeric AS today_revenue,
         COALESCE(SUM(CASE WHEN payment_mode = 'cash' THEN charges ELSE 0 END), 0)::numeric AS today_cash,
         COALESCE(SUM(CASE WHEN payment_mode = 'online' THEN charges ELSE 0 END), 0)::numeric AS today_online
       FROM visits
       WHERE clinic_id = $1
         AND visit_date::date = $2::date`,
      [clinicId, today]
    );

    // Low stock items count
    const { rows: stockRows } = await pool.query(
      `SELECT COUNT(*)::int AS low_stock
       FROM inventory_items
       WHERE clinic_id = $1 AND archived = false AND quantity <= threshold`,
      [clinicId]
    );

    const stats = todayRows[0];
    const todayPatients = Number(stats.today_patients);
    const todayRevenue = Number(stats.today_revenue);
    const todayCash = Number(stats.today_cash);
    const todayOnline = Number(stats.today_online);
    const lowStockItems = Number(stockRows[0].low_stock);

    // Fetch low-stock item names for AI briefing
    const { rows: lowStockNames } = await pool.query(
      `SELECT name FROM inventory_items
       WHERE clinic_id = $1 AND archived = false AND quantity <= threshold LIMIT 5`,
      [clinicId]
    );

    // Try AI briefing - call AI server internally
    let aiBriefing = `Today the clinic saw ${todayPatients} patients and collected ₹${todayRevenue.toLocaleString('en-IN')}: ₹${todayCash.toLocaleString('en-IN')} cash and ₹${todayOnline.toLocaleString('en-IN')} online.`;
    try {
      const aiUrl = process.env.AI_SERVER_URL || 'http://localhost:5001';
      const aiRes = await fetch(`${aiUrl}/api/ai/daily-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientCount: todayPatients,
          totalRevenue: todayRevenue,
          cashCollected: todayCash,
          onlineCollected: todayOnline,
          lowStockItems: lowStockNames.map(r => r.name),
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        if (aiJson.data?.briefing) aiBriefing = aiJson.data.briefing;
      }
    } catch {
      // AI is optional — use the deterministic fallback above
    }

    res.json({
      ok: true,
      data: {
        todayPatients,
        todayRevenue,
        todayCash,
        todayOnline,
        lowStockItems,
        pendingDrafts: 0,
        aiBriefing,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

module.exports = router;

