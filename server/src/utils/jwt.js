const jwt = require('jsonwebtoken');

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
} = process.env;

// ── Token expiry constants ─────────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// ── Generate access token ──────────────────────────────────────────────────
/**
 * Creates a short-lived JWT access token.
 * @param {string} userId - User's UUID
 * @param {string} role   - User's role (ADMIN | STUDENT)
 * @returns {string} Signed JWT
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { sub: userId, role },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// ── Generate refresh token ─────────────────────────────────────────────────
/**
 * Creates a long-lived JWT refresh token.
 * @param {string} userId - User's UUID
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// ── Verify access token ────────────────────────────────────────────────────
/**
 * Verifies and decodes an access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

// ── Verify refresh token ───────────────────────────────────────────────────
/**
 * Verifies and decodes a refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
