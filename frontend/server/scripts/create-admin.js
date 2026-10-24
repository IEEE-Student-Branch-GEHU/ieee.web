require('../config/load-environment');

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { createAdminRecord } = require('./admin-provisioning');

const createAdmin = async ({
  username = process.env.ADMIN_USERNAME,
  password = process.env.ADMIN_PASSWORD,
  mongoUri = process.env.MONGODB_URI,
  AdminModel = Admin,
  connect = (uri, options) => mongoose.connect(uri, options),
  disconnect = () => mongoose.disconnect(),
} = {}) => {
  const normalizedUsername = username?.trim();
  const normalizedMongoUri = mongoUri?.trim();

  if (!normalizedMongoUri || normalizedMongoUri === 'pending') {
    throw new Error('MONGODB_URI is required to create an administrator');
  }
  if (!normalizedUsername || !/^[A-Za-z0-9_.-]{3,64}$/.test(normalizedUsername)) {
    throw new Error('ADMIN_USERNAME must be 3-64 characters using letters, numbers, ., _, or -');
  }
  if (!password || password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  await connect(normalizedMongoUri, { serverSelectionTimeoutMS: 10000 });
  try {
    return await createAdminRecord({ username: normalizedUsername, password, AdminModel });
  } finally {
    await disconnect();
  }
};

if (require.main === module) {
  createAdmin()
    .then(() => console.log('Administrator created'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = { createAdmin };
