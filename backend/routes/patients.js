const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// All patient routes require auth
router.use(auth);

// GET /patients?search=
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const q = `%${search}%`;
    const { rows } = await pool.query(
      `SELECT id, name, phone, age, gender, created_at
       FROM patients
       WHERE clinic_id = $1
         AND (name ILIKE $2 OR phone ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.clinicId, q, limit, offset]
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// POST /patients
router.post('/', async (req, res) => {
  const { name, phone, age, gender } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'name is required' } });

  try {
    // If phone provided, check for existing patient in same clinic
    if (phone) {
      const existing = await pool.query(
        'SELECT id, name, phone, age, gender, created_at FROM patients WHERE clinic_id = $1 AND phone = $2',
        [req.clinicId, phone]
      );
      if (existing.rows.length > 0) {
        return res.json({ ok: true, data: existing.rows[0], existing: true });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO patients (clinic_id, name, phone, age, gender)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, phone, age, gender, created_at`,
      [req.clinicId, name, phone || null, age || null, gender || null]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// GET /patients/:id  — patient profile + visits
router.get('/:id', async (req, res) => {
  try {
    const { rows: patientRows } = await pool.query(
      'SELECT id, name, phone, age, gender, created_at FROM patients WHERE id = $1 AND clinic_id = $2',
      [req.params.id, req.clinicId]
    );
    if (!patientRows.length)
      return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Patient not found' } });

    const { rows: visitRows } = await pool.query(
      `SELECT id, visit_date, problem, diagnosis_or_solution, medicines, advice,
              charges, payment_mode, payment_status, follow_up_date
       FROM visits
       WHERE patient_id = $1 AND clinic_id = $2
       ORDER BY visit_date DESC`,
      [req.params.id, req.clinicId]
    );

    res.json({ ok: true, data: { ...patientRows[0], visits: visitRows } });
  } catch (e) {
    res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

module.exports = router;

