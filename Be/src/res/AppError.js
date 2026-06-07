class AppError extends Error {
  constructor(message, statusCode = 400, data = null) {
    super(message);
    this.statusCode = Number.isInteger(statusCode) ? statusCode : 400;
    this.data = data;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request", data = null) {
    super(message, 400, data);
    this.name = "BadRequestError";
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 400, { errors });
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal server error", data = null) {
    super(message, 500, data);
    this.name = "InternalServerError";
    this.isOperational = false;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError
};
