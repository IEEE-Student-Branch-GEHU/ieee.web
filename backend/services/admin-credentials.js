const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const normalizeAdminUsername = (username) => username.trim();

const hashAdminPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const verifyAdminPassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = {
  BCRYPT_ROUNDS,
  normalizeAdminUsername,
  hashAdminPassword,
  verifyAdminPassword,
};
