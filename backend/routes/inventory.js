const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /inventory
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, category, unit, quantity, threshold, expiry_date, archived,
              (quantity <= threshold) AS low_stock
       FROM inventory_items
       WHERE clinic_id = $1 AND archived = false
       ORDER BY name ASC`,
      [req.clinicId]
    );

    // Try AI inventory insight
    let aiInsight = null;
    try {
      const aiUrl = process.env.AI_SERVER_URL || 'http://localhost:5001';
      const aiRes = await fetch(`${aiUrl}/api/ai/inventory-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rows }),
        signal: AbortSignal.timeout(8000),
      });
      if (aiRes.ok) {
        const j = await aiRes.json();
        if (j.data?.insight_text) aiInsight = j.data;
      }
    } catch {
      // AI optional
    }

    res.json({ ok: true, data: rows, aiInsight });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// POST /inventory
router.post('/', async (req, res) => {
  const { name, category, unit, quantity, threshold, expiry_date } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'name is required' } });

  try {
    const { rows } = await pool.query(
      `INSERT INTO inventory_items (clinic_id, name, category, unit, quantity, threshold, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *, (quantity <= threshold) AS low_stock`,
      [req.clinicId, name, category || 'Other', unit || 'Units',
       Number(quantity) || 0, Number(threshold) || 0, expiry_date || null]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// PATCH /inventory/:id
router.patch('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE inventory_items
       SET quantity = $1
       WHERE id = $2 AND clinic_id = $3
       RETURNING *, (quantity <= threshold) AS low_stock`,
      [Number(quantity), req.params.id, req.clinicId]
    );
    if (!rows.length)
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

module.exports = router;

