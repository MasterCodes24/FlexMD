const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const otps = {}; // mock OTP store: { email: { code, expires } }

const fail = (res, status, code, message) =>
  res.status(status).json({ ok: false, error: { code, message } });

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, clinic_type } = req.body;
  if (!name || !email || !password || !phone)
    return fail(res, 400, 'VALIDATION_ERROR', 'name, email, password, phone are required');
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO clinics (name, email, phone, password_hash, clinic_type)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email`,
      [name, email, phone, hash, clinic_type || null]
    );
    res.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'EMAIL_EXISTS', 'Email already registered');
    fail(res, 500, 'SERVER_ERROR', e.message);
  }
});

// POST /auth/login  -> checks password, "sends" OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query('SELECT * FROM clinics WHERE email=$1', [email]);
  const clinic = r.rows[0];
  if (!clinic || !(await bcrypt.compare(password, clinic.password_hash)))
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Wrong email or password');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otps[email] = { code, expires: Date.now() + 5 * 60 * 1000, tries: 0 };
  console.log(`OTP for ${email}: ${code}`); // mock SMS
  res.json({ ok: true, data: { message: 'OTP sent', dev_otp: code } }); // remove dev_otp later
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const entry = otps[email];
  if (!entry || Date.now() > entry.expires)
    return fail(res, 400, 'OTP_EXPIRED', 'OTP expired, login again');
  if (++entry.tries > 5) return fail(res, 429, 'TOO_MANY_TRIES', 'Too many attempts');
  if (entry.code !== otp) return fail(res, 400, 'OTP_INVALID', 'Incorrect OTP');

  delete otps[email];
  const r = await pool.query('SELECT id, name FROM clinics WHERE email=$1', [email]);
  const token = jwt.sign({ clinic_id: r.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ ok: true, data: { token, clinic: r.rows[0] } });
});

module.exports = router;