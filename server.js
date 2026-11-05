require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// checks the database connection too
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
const auth = require('./middleware/auth');
app.use('/auth', require('./routes/auth'));

// temporary test route to check the token works
app.get('/me', auth, (req, res) => res.json({ ok: true, clinic_id: req.clinicId }));
app.listen(5000, () => console.log('Server running on port 5000'));