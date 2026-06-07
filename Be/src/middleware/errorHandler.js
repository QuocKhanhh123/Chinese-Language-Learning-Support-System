const ApiRes = require("../res/apiRes");
const { AppError } = require("../res/AppError");

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });

  if (err instanceof AppError || err.isOperational) {
    return ApiRes.error(
      res,
      err.message,
      err.statusCode || 400,
      err.data?.errors || null
    );
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return ApiRes.badRequest(res, "Validation failed", errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return ApiRes.conflict(res, `${field} already exists`);
  }

  if (err.name === 'CastError') {
    return ApiRes.badRequest(res, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiRes.unauthorized(res, "Invalid token");
  }

  if (err.name === 'TokenExpiredError') {
    return ApiRes.unauthorized(res, "Token expired");
  }

  if (err.name === 'MulterError') {
    return ApiRes.badRequest(res, `File upload error: ${err.message}`);
  }

  return ApiRes.serverError(
    res,
    process.env.NODE_ENV === 'development' 
      ? err.message 
      : "Something went wrong",
    process.env.NODE_ENV === 'development' 
      ? { stack: err.stack, message: err.message }
      : null
  );
};

module.exports = errorHandler;
