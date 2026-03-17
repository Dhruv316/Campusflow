const express = require('express');
const { body } = require('express-validator');

const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// ── Validation chains ──────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('rollNumber')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 }).withMessage('Roll number must be between 2 and 20 characters.'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department name is too long.'),

  body('year')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5.'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please provide a valid phone number.'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

const refreshValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required.'),
];

// ── Routes ─────────────────────────────────────────────────────────────────

// POST /api/v1/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/v1/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/v1/auth/logout  (protected — sends refreshToken in body to revoke)
router.post('/logout', protect, logout);

// POST /api/v1/auth/refresh
router.post('/refresh', refreshValidation, validate, refreshToken);

// GET /api/v1/auth/me
router.get('/me', protect, getMe);

module.exports = router;
