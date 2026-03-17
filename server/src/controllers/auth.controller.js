const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { sendWelcomeEmail } = require('../utils/email');

// ── Timing-safe dummy hash ─────────────────────────────────────────────────
// A real bcrypt hash is exactly 60 characters: $2b$12$ (7) + 22-char salt + 31-char hash.
// This valid-format dummy is used when a login attempt is made for a non-existent email,
// so bcrypt.compare still runs (~100ms) and prevents user-enumeration via timing attacks.
const DUMMY_HASH = '$2b$12$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

// ── Helper: persist refresh token in DB ───────────────────────────────────
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      id: uuidv4(),
      token,
      userId,
      expiresAt,
    },
  });
};

// ── Helper: strip password from user object before sending ────────────────
const formatUser = (user) => {
  const { password: _omit, ...safeUser } = user;
  return safeUser;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, year, phone } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check email uniqueness ─────────────────────────────────────────────
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingEmail) {
      return next(ApiError.conflict('An account with this email already exists.'));
    }

    // ── Check roll number uniqueness (if provided) ─────────────────────────
    if (rollNumber) {
      const existingRoll = await prisma.user.findUnique({
        where: { rollNumber: rollNumber.trim() },
        select: { id: true },
      });
      if (existingRoll) {
        return next(ApiError.conflict('This roll number is already registered.'));
      }
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user ────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'STUDENT', // Self-registration always creates students
        rollNumber: rollNumber?.trim() || null,
        department: department?.trim() || null,
        year: year ? parseInt(year, 10) : null,
        phone: phone?.trim() || null,
      },
    });

    // ── Generate & persist tokens ──────────────────────────────────────────
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    // ── Fire-and-forget welcome email ──────────────────────────────────────
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) => {
      console.error('[email] Welcome email failed:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to CampusFlow!',
      data: {
        user: formatUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // ── Fetch user ─────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // ── Constant-time password check ───────────────────────────────────────
    // Always run bcrypt.compare even when user is not found.
    // This keeps response time constant, preventing user-enumeration via timing.
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return next(ApiError.unauthorized('Invalid email or password.'));
    }

    // ── Guard: deactivated account ─────────────────────────────────────────
    if (!user.isActive) {
      return next(
        ApiError.unauthorized(
          'Your account has been deactivated. Please contact administration.'
        )
      );
    }

    // ── Generate & persist tokens ──────────────────────────────────────────
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: formatUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Revoke the specific refresh token if provided
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return next(ApiError.badRequest('Refresh token is required.'));
    }

    // ── Verify JWT signature ───────────────────────────────────────────────
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return next(
        ApiError.unauthorized('Invalid or expired refresh token. Please log in again.')
      );
    }

    // ── Look up stored token (confirms it hasn't been revoked) ─────────────
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            rollNumber: true,
            department: true,
            year: true,
            phone: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!storedToken) {
      return next(
        ApiError.unauthorized('Refresh token has been revoked. Please log in again.')
      );
    }

    // ── Check DB-level expiry ──────────────────────────────────────────────
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return next(
        ApiError.unauthorized('Refresh token has expired. Please log in again.')
      );
    }

    const user = storedToken.user;

    // ── Verify token belongs to the claimed user ───────────────────────────
    if (decoded.sub !== user.id) {
      return next(ApiError.unauthorized('Token mismatch. Please log in again.'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('Account deactivated. Please contact administration.'));
    }

    // ── Issue new access token ─────────────────────────────────────────────
    const newAccessToken = generateAccessToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed.',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware — password field excluded
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
};
