require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { authLimiter, strictLimiter, apiLimiter } = require('./middleware/rateLimiter.middleware');
const logger = require('./utils/logger');

// ── Route imports ──────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const eventRoutes        = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const userRoutes         = require('./routes/user.routes');
const certificateRoutes  = require('./routes/certificate.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes    = require('./routes/analytics.routes');
const healthRoutes       = require('./routes/health.routes');

const app = express();

// ── Request ID middleware ──────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ── Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ── Security headers ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── ✅ FIXED CORS (NO allowedOrigins ANYWHERE) ──────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Input sanitization ─────────────────────────────────────────────────────
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.includes('$') || key.includes('.')) continue;
    clean[key] = typeof obj[key] === 'object' ? sanitizeObject(obj[key]) : obj[key];
  }
  return clean;
};

app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// ── HTTP request logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
      {
        stream: {
          write: (msg) => logger.info(msg.trim()),
        },
      }
    )
  );
}

// ── Health check ───────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRoutes);

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth/refresh', strictLimiter);
app.use('/api/v1/certificates', strictLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ── API Routes ─────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/events`,        eventRoutes);
app.use(`${API}/registrations`, registrationRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/certificates`,  certificateRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
