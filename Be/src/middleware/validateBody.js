const { ZodError } = require('zod');

module.exports.validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); 
    return next();
  } catch (err) {
    console.error("Validation error:", err);
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        issues: err.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message
        }))
      });
    }
    return res.status(400).json({ success: false, error: 'INVALID_BODY' });
  }
};
