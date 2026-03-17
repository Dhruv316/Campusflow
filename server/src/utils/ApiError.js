/**
 * CampusFlow — Custom API Error Class
 *
 * Extends the native Error object to carry HTTP status codes,
 * structured error arrays, and an operational flag for clean
 * distinction between expected errors and programmer bugs.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   * @param {string} message    - Human-readable error message
   * @param {Array}  errors     - Optional array of validation/field errors
   * @param {string} stack      - Optional stack trace override
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = true; // Distinguishes expected errors from bugs

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Static factory methods for common HTTP errors ──────────────────────

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
