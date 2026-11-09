const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.clinicId = payload.clinic_id;
    next();
  } catch (e) {
    res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required' } });
  }
};