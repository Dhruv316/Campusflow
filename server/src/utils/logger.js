const winston = require('winston');
const path    = require('path');

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const isDev  = process.env.NODE_ENV !== 'production';
const isProd = process.env.NODE_ENV === 'production';

// ── Custom console format ──────────────────────────────────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts}${rid} ${level}: ${stack || message}${extras}`;
  })
);

// ── File format (structured JSON) ─────────────────────────────────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ── Transports ────────────────────────────────────────────────────────────
const transports = [];

// Console — dev: all levels; prod: warn and above only
transports.push(
  new winston.transports.Console({
    level:  isProd ? 'warn' : 'debug',
    format: consoleFormat,
    silent: false,
  })
);

// File transports — always active
const logsDir = path.join(process.cwd(), 'logs');

transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level:    'error',
    format:   fileFormat,
    maxsize:  10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    level:    'debug',
    format:   fileFormat,
    maxsize:  20 * 1024 * 1024, // 20 MB
    maxFiles: 10,
  })
);

// ── Logger instance ────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level:            isDev ? 'debug' : 'info',
  defaultMeta:      { service: 'campusflow-api' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format:   fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format:   fileFormat,
    }),
  ],
});

module.exports = logger;
