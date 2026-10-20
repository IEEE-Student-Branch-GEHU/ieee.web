const {
  hashAdminPassword,
  normalizeAdminUsername,
} = require('../services/admin-credentials');

const createAdminRecord = async ({ username, password, AdminModel }) => {
  const normalizedUsername = normalizeAdminUsername(username);
  const existing = await AdminModel.exists({ username: normalizedUsername });
  if (existing) throw new Error('An administrator with that username already exists');

  return AdminModel.create({
    username: normalizedUsername,
    password: await hashAdminPassword(password),
  });
};

const updateAdminPassword = async ({ username, password, AdminModel }) => {
  const normalizedUsername = normalizeAdminUsername(username);
  const admin = await AdminModel.findOne({ username: normalizedUsername });
  if (!admin) throw new Error(`Administrator ${normalizedUsername} does not exist`);

  admin.password = await hashAdminPassword(password);
  await admin.save();
  return admin;
};

module.exports = { createAdminRecord, updateAdminPassword };
