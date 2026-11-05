import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiError.validation('Validation failed', errors);
  }

  // Safely assign validated/coerced values
  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query && req.query) {
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, result.data.query);
  }
  
  next();
};
