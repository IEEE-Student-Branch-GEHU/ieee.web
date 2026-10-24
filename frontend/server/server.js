require('./config/load-environment');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const { getEnvironmentConfig } = require('./config/environment');
const { createCorsMiddleware, createOriginGuard } = require('./middleware/cors');
const { createGlobalLimiter } = require('./config/rate-limit');
const { connectDatabase } = require('./config/database');

const app = express();
const config = getEnvironmentConfig();
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const memberRoutes = require('./routes/member');

// Trust only the explicitly configured number of reverse-proxy hops. The
// default is zero so direct clients cannot forge X-Forwarded-For locally.
app.set('trust proxy', config.trustedProxyHops);

// Global Rate Limiter: Apply to all /api routes
// Purpose: Prevent abuse by limiting requests per IP address
// Protects against brute force attacks and DoS
const globalLimiter = createGlobalLimiter();
app.locals.globalLimiter = globalLimiter;

// Middleware
app.use(createOriginGuard(config.allowedOrigins));
app.use(createCorsMiddleware(config.allowedOrigins));
// Apply the global API limiter before JSON parsing or route work.
app.use('/api', globalLimiter);
app.use(express.json());
// Express 5 exposes req.query through a getter. Make it writable before the
// sanitizer replaces the sanitized query object, as required by the package.
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: req.query,
  });
  next();
});
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/member', memberRoutes);

// Process availability check for the standalone server.
app.get('/', (req, res) => {
  res.send('IEEE Website Backend is Running');
});

// Readiness check. Next.js rewrites /health to /api/health.
app.get(['/health', '/api/health'], (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
  return res.json({ status: 'ready', database: 'connected' });
});

const ensureDatabase = () => connectDatabase(config.mongoUri);

const startServer = async () => {
  if (config.mongoUri) {
    await ensureDatabase();
    console.log('Connected to MongoDB Atlas');
  }

  return new Promise((resolve) => {
    let server;
    server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on port ${config.port}`);
      resolve(server);
    });
  });
};

app.startServer = startServer;
app.ensureDatabase = ensureDatabase;

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Backend startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
