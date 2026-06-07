const { ZodError } = require('zod');
const { ValidationError } = require('../res/AppError');

module.exports.validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      throw new ValidationError("Validation failed", errors);
    }
    next(err);
  }
};

module.exports.validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      throw new ValidationError("Validation failed", errors);
    }
    next(err);
  }
};
