// centralized error handler - decides status code + response shape for every error
function errorHandler(err, req, res, next) {
  // Mongoose schema validation failures (enum, required, etc)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // malformed MongoDB ObjectId (e.g. a broken :id in the URL)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // MongoDB duplicate key error (e.g. unique email collision)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value entered' });
  }

  // errors we threw ourselves on purpose already know their own status code
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // anything else is unexpected - log it, don't leak internals to the client
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our end' });
}

module.exports = errorHandler;