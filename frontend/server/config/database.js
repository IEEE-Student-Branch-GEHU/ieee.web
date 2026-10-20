const mongoose = require('mongoose');

// Serverless functions reuse a warm instance between requests, so the
// connection promise is cached on the module instead of reconnecting per call.
let connecting = null;

const connectDatabase = async (mongoUri) => {
  if (!mongoUri) return;
  if (mongoose.connection.readyState === 1) return;

  if (!connecting) {
    connecting = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 }).catch((error) => {
      connecting = null;
      const startupError = new Error('MongoDB connection failed');
      startupError.code = 'MONGODB_CONNECTION_FAILED';
      startupError.cause = error;
      throw startupError;
    });
  }

  await connecting;
};

module.exports = { connectDatabase };
