const cors = require('cors');

const createOriginGuard = (allowedOrigins) => (req, res, next) => {
  const requestOrigin = req.get('Origin');

  // Non-browser clients do not send Origin and are still protected by the API
  // authentication and rate-limit middleware.
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return next();

  return res.status(403).json({ message: 'Origin is not allowed' });
};

const createCorsMiddleware = (allowedOrigins) => cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, false);
    return callback(null, allowedOrigins.includes(requestOrigin) ? requestOrigin : false);
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
});

module.exports = { createCorsMiddleware, createOriginGuard };
