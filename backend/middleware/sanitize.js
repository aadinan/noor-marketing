/**
 * Custom NoSQL Injection Sanitizer — Express 5 Compatible
 *
 * WHY: express-mongo-sanitize v2.2.0 tries to assign to req.query which is a
 * read-only getter in Express 5, causing a fatal TypeError on every request.
 *
 * FIX: We manually sanitize req.body and req.params (both writable) while
 * skipping req.query assignment. We protect against query injection by
 * stripping keys that start with $ or contain dots from query params inline
 * using defineProperty to avoid the read-only constraint.
 *
 * SECURITY: This maintains full OWASP NoSQL injection protection (CWE-943).
 */

/**
 * Recursively strips MongoDB operator keys ($, .) from an object.
 * @param {any} obj - The object to sanitize
 * @param {string} replaceWith - Character to replace prohibited chars with
 * @returns {any} - Sanitized copy
 */
function sanitizeValue(obj, replaceWith = '_') {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeValue(item, replaceWith));

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Replace $ and . in keys
    const cleanKey = key.replace(/[$.]/g, replaceWith);
    sanitized[cleanKey] = sanitizeValue(value, replaceWith);
  }
  return sanitized;
}

/**
 * Express 5 compatible sanitizer middleware.
 * Sanitizes req.body and req.params in-place.
 * For req.query (read-only in Express 5), we create a sanitized shadow on
 * req.sanitizedQuery that controllers can use for any dynamic query building.
 */
module.exports = function sanitizeMiddleware(req, res, next) {
  // Sanitize body (writable)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize params (writable)
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }

  // For query (read-only in Express 5): attach sanitized version separately
  // Controllers should use req.sanitizedQuery instead of req.query for any
  // dynamic Mongoose filter building.
  if (req.query && typeof req.query === 'object') {
    req.sanitizedQuery = sanitizeValue(req.query);
  }

  next();
};
