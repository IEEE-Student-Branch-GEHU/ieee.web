const jwt = require('jsonwebtoken');

const ADMIN_TOKEN_ISSUER = 'ieee-gehu-admin';
const ADMIN_TOKEN_AUDIENCE = 'ieee-gehu-admin-client';
const ADMIN_TOKEN_PURPOSE = 'admin-access';

const createAdminToken = ({ username }, secret, options = {}) => jwt.sign(
  { username: String(username), purpose: ADMIN_TOKEN_PURPOSE },
  secret,
  {
    algorithm: 'HS256',
    issuer: ADMIN_TOKEN_ISSUER,
    audience: ADMIN_TOKEN_AUDIENCE,
    expiresIn: options.expiresIn || '1h',
  },
);

const verifyAdminToken = (token, secret) => jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: ADMIN_TOKEN_ISSUER,
  audience: ADMIN_TOKEN_AUDIENCE,
});

module.exports = {
  ADMIN_TOKEN_AUDIENCE,
  ADMIN_TOKEN_ISSUER,
  ADMIN_TOKEN_PURPOSE,
  createAdminToken,
  verifyAdminToken,
};
