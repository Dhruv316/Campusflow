const prisma = require('../utils/prisma');
const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * protect — JWT Authentication Middleware
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, attaches the full user object (sans password) to req.user.
 * On failure, calls next() with an appropriate ApiError.
 */
const protect = async (req, res, next) => {
  try {
    // ── Extract token from header ──────────────────────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('No authentication token provided.'));
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    if (!token) {
      return next(ApiError.unauthorized('Malformed authorization header.'));
    }

    // ── Verify token signature & expiry ───────────────────────────────────
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return next(
          ApiError.unauthorized('Your session has expired. Please log in again.')
        );
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    // ── Fetch user from DB ────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
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
        // password intentionally excluded
      },
    });

    if (!user) {
      return next(
        ApiError.unauthorized(
          'The user belonging to this token no longer exists.'
        )
      );
    }

    if (!user.isActive) {
      return next(
        ApiError.unauthorized(
          'Your account has been deactivated. Please contact administration.'
        )
      );
    }

    // ── Attach to request ─────────────────────────────────────────────────
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * restrictTo — Role-Based Access Control Middleware
 *
 * Must be used AFTER the protect middleware.
 * Accepts one or more allowed roles as arguments.
 *
 * Usage:
 *   router.get('/admin-only', protect, restrictTo('ADMIN'), handler)
 *   router.get('/shared',     protect, restrictTo('ADMIN', 'STUDENT'), handler)
 *
 * @param {...string} roles - One or more allowed role strings
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required: ${roles.join(' or ')}. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
};

module.exports = { protect, restrictTo };
