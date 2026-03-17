const ApiError = require('../utils/ApiError');
const logger   = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

// ── Prisma error code map ──────────────────────────────────────────────────
const PRISMA_ERRORS = {
  P2002: (err) => {
    const fields = err.meta?.target
      ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target)
      : 'field';
    return new ApiError(409, `A record with this ${fields} already exists.`);
  },
  P2025: () => new ApiError(404, 'Resource not found.'),
  P2003: () => new ApiError(400, 'Invalid reference: related record does not exist.'),
  P2014: () => new ApiError(400, 'This change would violate a required relation.'),
  P2021: () => new ApiError(500, 'Database table not found. Run migrations.'),
  P2022: () => new ApiError(500, 'Database column not found. Run migrations.'),
};

// ── JWT error name map ─────────────────────────────────────────────────────
const JWT_ERRORS = {
  JsonWebTokenError: new ApiError(401, 'Invalid token. Please log in again.'),
  TokenExpiredError: new ApiError(401, 'Your session has expired. Please log in again.'),
  NotBeforeError:    new ApiError(401, 'Token not yet active.'),
};

// ── Global error handler ───────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log every error with request context
  logger.error(err.message || 'Unknown error', {
    requestId: req.id,
    method:    req.method,
    path:      req.path,
    status:    err.statusCode || err.status || 500,
    stack:     isProd ? undefined : err.stack,
    prismaCode: err.code,
  });

  // ── Operational ApiError (intentional) ─────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && err.errors.length > 0 ? { errors: err.errors } : {}),
      ...(!isProd ? { stack: err.stack } : {}),
    });
  }

  // ── Prisma known errors ─────────────────────────────────────────────────
  if (err.code && PRISMA_ERRORS[err.code]) {
    const apiErr = PRISMA_ERRORS[err.code](err);
    return res.status(apiErr.statusCode).json({
      success: false,
      message: apiErr.message,
      ...(!isProd ? { prismaCode: err.code } : {}),
    });
  }

  // ── JWT errors ──────────────────────────────────────────────────────────
  if (err.name && JWT_ERRORS[err.name]) {
    const apiErr = JWT_ERRORS[err.name];
    return res.status(apiErr.statusCode).json({
      success: false,
      message: apiErr.message,
    });
  }

  // ── JSON body parse error ────────────────────────────────────────────────
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
    });
  }

  // ── Payload too large ────────────────────────────────────────────────────
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large.',
    });
  }

  // ── Unhandled / unknown error ────────────────────────────────────────────
  const status  = err.statusCode || err.status || 500;
  const message = isProd
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
    ...(!isProd ? { stack: err.stack } : {}),
  });
};

// ── 404 handler ────────────────────────────────────────────────────────────
const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFoundHandler };
