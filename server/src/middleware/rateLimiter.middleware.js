const rateLimit = require('express-rate-limit');

const rateLimitResponse = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
  });
};

/**
 * authLimiter — for /auth/login and /auth/register
 * 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         rateLimitResponse,
  skipSuccessfulRequests: false,
});

/**
 * strictLimiter — for /auth/refresh and /certificates/:id/download
 * 5 requests per 15 minutes per IP
 */
const strictLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         rateLimitResponse,
});

/**
 * apiLimiter — general limiter for all other /api routes
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         rateLimitResponse,
});

module.exports = { authLimiter, strictLimiter, apiLimiter };
