const cors = require('cors');

// The API is served by the same Next.js deployment as the pages, so a browser
// request whose Origin matches the requested host is same-origin. This keeps
// Vercel preview deployments working without listing every preview URL.
const isSameOrigin = (req, requestOrigin) => {
  try {
    return new URL(requestOrigin).host === req.get('host');
  } catch {
    return false;
  }
};

const createOriginGuard = (allowedOrigins) => (req, res, next) => {
  const requestOrigin = req.get('Origin');

  // Non-browser clients do not send Origin and are still protected by the API
  // authentication and rate-limit middleware.
  if (!requestOrigin || allowedOrigins.includes(requestOrigin) || isSameOrigin(req, requestOrigin)) return next();

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
