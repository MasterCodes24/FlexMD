require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Auth ───────────────────────────────────────────────────────────────────
const auth = require('./middleware/auth');
app.use('/auth', require('./routes/auth'));

// ── Protected test route ───────────────────────────────────────────────────
app.get('/me', auth, (req, res) => res.json({ ok: true, clinic_id: req.clinicId }));

// ── Core clinic routes (all protected by JWT inside each router) ───────────
app.use('/patients', require('./routes/patients'));
app.use('/visits', require('./routes/visits'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/revenue', require('./routes/revenue'));
app.use('/inventory', require('./routes/inventory'));

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[ClinicFlow Backend] Running on port ${PORT}`));
