// a custom error type for errors we throw on purpose, with a known status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as an expected error, not a crash
  }
}

module.exports = AppError;