const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * validate — express-validator result checker (used by auth routes).
 * Place after an array of express-validator chains.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field:   e.path || e.param,
      message: e.msg,
    }));
    const mainMsg = formatted[0]?.message || 'Validation failed.';
    return next(new ApiError(422, mainMsg, formatted));
  }
  next();
};

/**
 * validateBody(schema) — Zod schema validation middleware factory.
 * Takes a Zod schema and returns an Express middleware that validates req.body.
 *
 * Usage:
 *   router.post('/event', validateBody(createEventSchema), controller);
 *
 * @param {import('zod').ZodSchema} schema
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formatted = result.error.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    const mainMsg = formatted[0]?.message || 'Validation failed.';
    return next(new ApiError(400, mainMsg, formatted));
  }
  req.body = result.data;
  next();
};

module.exports = { validate, validateBody };
