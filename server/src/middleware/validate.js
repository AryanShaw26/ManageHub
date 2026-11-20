import { errorResponse } from '../utils/response.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with parsed/sanitized versions
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Please check the submitted information', details);
    }
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid request data');
  }
};
