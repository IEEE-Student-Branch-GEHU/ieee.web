require('../config/load-environment');

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { normalizeAdminUsername } = require('../services/admin-credentials');
const { updateAdminPassword } = require('./admin-provisioning');

const TEST_ADMIN_USERNAME = 'ieee_test_admin';
const TEST_DATABASE_NAME = 'test';

const resetAdminPassword = async ({
  username = process.env.ADMIN_USERNAME,
  password = process.env.ADMIN_PASSWORD,
  mongoUri = process.env.MONGODB_URI,
  AdminModel = Admin,
  connect = (uri, options) => mongoose.connect(uri, options),
  disconnect = () => mongoose.disconnect(),
  databaseName,
} = {}) => {
  const normalizedUsername = username?.trim();
  const normalizedMongoUri = mongoUri?.trim();

  if (normalizedUsername !== TEST_ADMIN_USERNAME) {
    throw new Error(`Password reset is restricted to ${TEST_ADMIN_USERNAME}`);
  }
  if (!normalizedMongoUri || normalizedMongoUri === 'pending') {
    throw new Error('MONGODB_URI is required to reset the test administrator password');
  }
  if (!password || password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  try {
    await connect(normalizedMongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch {
    throw new Error('Could not connect to the dedicated test database');
  }
  try {
    const selectedDatabaseName = databaseName ?? mongoose.connection.name;
    if (selectedDatabaseName !== TEST_DATABASE_NAME) {
      throw new Error('Password reset requires the dedicated test database');
    }

    try {
      return await updateAdminPassword({
        username: normalizeAdminUsername(normalizedUsername),
        password,
        AdminModel,
      });
    } catch (error) {
      if (error.message === `Administrator ${TEST_ADMIN_USERNAME} does not exist`) throw error;
      throw new Error('Could not update the dedicated test administrator');
    }
  } finally {
    try {
      await disconnect();
    } catch {
      // Do not replace a useful reset result with a driver shutdown error.
    }
  }
};

if (require.main === module) {
  resetAdminPassword()
    .then(() => console.log('Test administrator password reset'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = { resetAdminPassword, TEST_ADMIN_USERNAME, TEST_DATABASE_NAME };
