const rateLimit = require('express-rate-limit');

// The default key is req.ip. The default store is process-local MemoryStore;
// a shared store is required if the backend is scaled beyond one instance.
const globalRateLimitOptions = Object.freeze({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimitOptions = Object.freeze({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts from this IP, please try again after an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createGlobalLimiter = (overrides = {}) => rateLimit({ ...globalRateLimitOptions, ...overrides });
const createLoginLimiter = (overrides = {}) => rateLimit({ ...loginRateLimitOptions, ...overrides });

module.exports = {
  createGlobalLimiter,
  createLoginLimiter,
  globalRateLimitOptions,
  loginRateLimitOptions,
};
