const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /revenue/summary
router.get('/summary', async (req, res) => {
  try {
    const clinicId = req.clinicId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    // Lifetime total
    const { rows: lifetimeRows } = await pool.query(
      `SELECT COALESCE(SUM(charges), 0)::numeric AS total FROM visits WHERE clinic_id = $1`,
      [clinicId]
    );

    // Current month
    const { rows: monthRows } = await pool.query(
      `SELECT
         COALESCE(SUM(charges), 0)::numeric AS total,
         COALESCE(SUM(CASE WHEN payment_mode='cash' THEN charges ELSE 0 END), 0)::numeric AS cash,
         COALESCE(SUM(CASE WHEN payment_mode='online' THEN charges ELSE 0 END), 0)::numeric AS online
       FROM visits
       WHERE clinic_id = $1 AND visit_date::date >= $2::date`,
      [clinicId, monthStart]
    );

    // Daily history (last 10 days)
    const { rows: dailyRows } = await pool.query(
      `SELECT
         visit_date::date AS date,
         COALESCE(SUM(charges), 0)::numeric AS total,
         COALESCE(SUM(CASE WHEN payment_mode='cash' THEN charges ELSE 0 END), 0)::numeric AS cash,
         COALESCE(SUM(CASE WHEN payment_mode='online' THEN charges ELSE 0 END), 0)::numeric AS online
       FROM visits
       WHERE clinic_id = $1
       GROUP BY visit_date::date
       ORDER BY visit_date::date DESC
       LIMIT 10`,
      [clinicId]
    );

    const totalLifetime = Number(lifetimeRows[0].total);
    const currentMonth = {
      total: Number(monthRows[0].total),
      cash: Number(monthRows[0].cash),
      online: Number(monthRows[0].online),
    };
    const onlinePct = currentMonth.total > 0
      ? Math.round((currentMonth.online / currentMonth.total) * 100)
      : 0;

    const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    // AI summaries — call AI server
    let aiSummaries = {
      daily: `Today the clinic collected ₹${currentMonth.total.toLocaleString('en-IN')}.`,
      monthly: `In ${monthName}, the clinic earned ₹${currentMonth.total.toLocaleString('en-IN')}. Online payments account for ${onlinePct}% of collections.`,
    };
    try {
      const aiUrl = process.env.AI_SERVER_URL || 'http://localhost:5001';

      // Today's stats for daily summary
      const { rows: todayStats } = await pool.query(
        `SELECT
           COALESCE(SUM(charges), 0)::numeric AS total,
           COALESCE(SUM(CASE WHEN payment_mode='cash' THEN charges ELSE 0 END), 0)::numeric AS cash,
           COALESCE(SUM(CASE WHEN payment_mode='online' THEN charges ELSE 0 END), 0)::numeric AS online,
           COUNT(*)::int AS patients
         FROM visits WHERE clinic_id = $1 AND visit_date::date = $2::date`,
        [clinicId, today]
      );
      const td = todayStats[0];

      const [dailyRes, monthlyRes] = await Promise.allSettled([
        fetch(`${aiUrl}/api/ai/daily-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientCount: Number(td.patients),
            totalRevenue: Number(td.total),
            cashCollected: Number(td.cash),
            onlineCollected: Number(td.online),
          }),
          signal: AbortSignal.timeout(8000),
        }),
        fetch(`${aiUrl}/api/ai/monthly-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthName,
            totalRevenue: currentMonth.total,
            totalVisits: dailyRows.reduce((s, r) => s + 1, 0),
            onlinePercentage: onlinePct,
          }),
          signal: AbortSignal.timeout(8000),
        }),
      ]);

      if (dailyRes.status === 'fulfilled' && dailyRes.value.ok) {
        const j = await dailyRes.value.json();
        if (j.data?.briefing) aiSummaries.daily = j.data.briefing;
      }
      if (monthlyRes.status === 'fulfilled' && monthlyRes.value.ok) {
        const j = await monthlyRes.value.json();
        if (j.data?.summary_text) aiSummaries.monthly = j.data.summary_text;
      }
    } catch {
      // AI optional — use deterministic fallbacks
    }

    res.json({
      ok: true,
      data: {
        totalLifetime,
        currentMonth,
        dailyHistory: dailyRows,
        aiSummaries,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

module.exports = router;

