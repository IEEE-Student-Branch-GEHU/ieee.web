import mongoose from 'mongoose';

const globalForIeee = globalThis;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (globalForIeee.__ieeeMongoPromise) return globalForIeee.__ieeeMongoPromise;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('Database is not configured');

  globalForIeee.__ieeeMongoPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  }).catch((error) => {
    globalForIeee.__ieeeMongoPromise = null;
    throw error;
  });

  return globalForIeee.__ieeeMongoPromise;
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;
