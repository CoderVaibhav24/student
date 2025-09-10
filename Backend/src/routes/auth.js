const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { ok, created, badRequest, conflict, serverError, forbidden } = require('../utils/responses');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const cookieName = process.env.COOKIE_NAME || 'access_token';
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    path: '/',
    // Persist for a day by default (match JWT_EXPIRES=1d)
    maxAge: 24 * 60 * 60 * 1000
  };
}

// ===== VALIDATORS =====
const registerValidators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password 8+ chars required'),
  body('level').isIn([1,2,3]).withMessage('level must be 1/2/3'),
  body('studentProfile').optional().isObject()
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 1 }).withMessage('Password required')
];

// ===== REGISTER (admin-only after first user) =====
router.post('/register', optionalAuth, registerValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return badRequest(res, errors.array().map(e => e.msg).join(', '));

  const { name, email, password, level, studentProfile } = req.body;

  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const isFirstUser = count === 0;

    // If not first user, require admin (level 1)
    if (!isFirstUser) {
      if (!req.user || req.user.level !== 1) {
        return forbidden(res, 'Only admin can register new users');
      }
    }

    const [exists] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (exists.length) return conflict(res, 'Email already in use');

    const password_hash = await bcrypt.hash(password, 10);
    const [ins] = await pool.query(
      'INSERT INTO users (name, email, password_hash, level) VALUES (?,?,?,?)',
      [name, email, password_hash, level]
    );

    let studentId = null;
    if (level === 3) {
      const s = studentProfile || {};
      const [sIns] = await pool.query(
        `INSERT INTO students (user_id, full_name, email, phone, guardian_name, class_name, section_name, status)
         VALUES (?,?,?,?,?,?,?,?)`,
        [ins.insertId, s.full_name || name, email || null, s.phone || null, s.guardian_name || null, s.class_name || null, s.section_name || null, 'active']
      );
      studentId = sIns.insertId;
    }

    return created(res, { user_id: ins.insertId, student_id: studentId }, isFirstUser ? 'First user created (bootstrap)' : 'User created');
  } catch (err) {
    return serverError(res, err);
  }
});

// ===== LOGIN (sets JWT cookie) =====
router.post('/login', loginValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return badRequest(res, errors.array().map(e => e.msg).join(', '));

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, level, is_active FROM users WHERE email = ?', [email]
    );
    if (!rows.length) return badRequest(res, 'Invalid credentials');

    const user = rows[0];
    if (!user.is_active) return badRequest(res, 'Account disabled');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return badRequest(res, 'Invalid credentials');

    const token = jwt.sign(
      { id: user.id, level: user.level, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.cookie(cookieName, token, cookieOptions());
    return ok(res, { user: { id: user.id, name: user.name, email: user.email, level: user.level } }, 'Logged in');
  } catch (err) {
    return serverError(res, err);
  }
});

// ===== LOGOUT (clears cookie) =====
router.post('/logout', (_req, res) => {
  res.clearCookie(cookieName, cookieOptions());
  return ok(res, {}, 'Logged out');
});

// ===== ME (quick test to see if cookie works) =====
router.get('/me', require('../middleware/auth'), (req, res) => {
  return ok(res, { user: req.user });
});

module.exports = router;
