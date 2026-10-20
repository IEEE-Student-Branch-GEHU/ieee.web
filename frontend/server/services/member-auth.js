const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BCRYPT_ROUNDS = 12;
const MEMBER_PASSWORD_MIN_LENGTH = 12;
const MEMBER_PASSWORD_MAX_LENGTH = 128;
const MEMBER_TOKEN_ISSUER = 'ieee-gehu-member';
const MEMBER_TOKEN_AUDIENCE = 'ieee-gehu-member-client';
const MEMBER_TOKEN_PURPOSE = 'member-access';
const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const normalizeMemberUsername = (username) => {
  if (typeof username !== 'string') return '';
  return username.trim().toLowerCase();
};

const isValidMemberUsername = (username) => (
  typeof username === 'string'
  && /^[a-z0-9][a-z0-9._-]{2,63}$/.test(username)
);

const assertValidMemberPassword = (password) => {
  if (typeof password !== 'string'
    || password.length < MEMBER_PASSWORD_MIN_LENGTH
    || password.length > MEMBER_PASSWORD_MAX_LENGTH
    || password.trim() === '') {
    throw new Error(`Password must be between ${MEMBER_PASSWORD_MIN_LENGTH} and ${MEMBER_PASSWORD_MAX_LENGTH} characters`);
  }
  return password;
};

const hashMemberPassword = (password) => bcrypt.hash(assertValidMemberPassword(password), BCRYPT_ROUNDS);

const verifyMemberPassword = (password, passwordHash) => (
  typeof password === 'string'
  && typeof passwordHash === 'string'
  && bcrypt.compare(password, passwordHash)
);

const createActivationToken = () => crypto.randomBytes(32).toString('base64url');

const hashActivationToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const createMemberToken = ({ memberId, teamId, tokenVersion = 0 }, secret, options = {}) => jwt.sign(
  {
    purpose: MEMBER_TOKEN_PURPOSE,
    teamId: String(teamId),
    ver: Number.isInteger(tokenVersion) ? tokenVersion : 0,
  },
  secret,
  {
    algorithm: 'HS256',
    subject: String(memberId),
    issuer: MEMBER_TOKEN_ISSUER,
    audience: MEMBER_TOKEN_AUDIENCE,
    expiresIn: options.expiresIn || '1h',
  },
);

const verifyMemberToken = (token, secret) => jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: MEMBER_TOKEN_ISSUER,
  audience: MEMBER_TOKEN_AUDIENCE,
});

module.exports = {
  ACTIVATION_TOKEN_TTL_MS,
  BCRYPT_ROUNDS,
  MEMBER_PASSWORD_MAX_LENGTH,
  MEMBER_PASSWORD_MIN_LENGTH,
  MEMBER_TOKEN_AUDIENCE,
  MEMBER_TOKEN_ISSUER,
  MEMBER_TOKEN_PURPOSE,
  assertValidMemberPassword,
  createActivationToken,
  createMemberToken,
  hashActivationToken,
  hashMemberPassword,
  isValidMemberUsername,
  normalizeMemberUsername,
  verifyMemberPassword,
  verifyMemberToken,
};
