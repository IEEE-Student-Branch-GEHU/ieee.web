require('../config/load-environment');

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { normalizeAdminUsername, verifyAdminPassword } = require('../services/admin-credentials');

const run = async () => {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!username || !password || !mongoUri || mongoUri === 'pending') {
    throw new Error('Dedicated admin diagnostic configuration is incomplete');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const record = await Admin.findOne({ username: normalizeAdminUsername(username) })
    .select('+password')
    .lean();
  const storedHashIsBcrypt = typeof record?.password === 'string'
    && /^\$2[aby]\$\d{2}\$/.test(record.password);
  const passwordMatches = storedHashIsBcrypt && await verifyAdminPassword(password, record.password);

  if (!record || !passwordMatches) {
    throw new Error('Admin diagnostic could not verify the configured account');
  }

  console.log(JSON.stringify({ diagnostic: 'admin_credentials_verified' }));
};

run()
  .catch((error) => {
    console.error(JSON.stringify({ diagnosticFailed: true, errorType: error.name }));
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
