import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { RateLimit } from './models';

export const ADMIN_TOKEN_ISSUER = 'ieee-gehu-admin';
export const ADMIN_TOKEN_AUDIENCE = 'ieee-gehu-admin-client';
export const ADMIN_TOKEN_PURPOSE = 'admin-access';
export const MEMBER_TOKEN_ISSUER = 'ieee-gehu-member';
export const MEMBER_TOKEN_AUDIENCE = 'ieee-gehu-member-client';
export const MEMBER_TOKEN_PURPOSE = 'member-access';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) throw new ApiError(503, 'JWT_SECRET must be at least 32 characters');
  return secret;
};

const bearer = (request) => {
  const value = request.headers.get('authorization');
  const match = value?.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] || null;
};

export const createAdminToken = (username) => jwt.sign(
  { username: String(username), purpose: ADMIN_TOKEN_PURPOSE },
  jwtSecret(),
  { algorithm: 'HS256', issuer: ADMIN_TOKEN_ISSUER, audience: ADMIN_TOKEN_AUDIENCE, expiresIn: '1h' },
);

export const verifyAdminRequest = (request) => {
  const token = bearer(request);
  if (!token) throw new ApiError(401, 'No token, authorization denied');
  try {
    const decoded = jwt.verify(token, jwtSecret(), {
      algorithms: ['HS256'], issuer: ADMIN_TOKEN_ISSUER, audience: ADMIN_TOKEN_AUDIENCE,
    });
    if (decoded?.purpose !== ADMIN_TOKEN_PURPOSE) throw new Error('Invalid purpose');
    return decoded;
  } catch {
    throw new ApiError(401, 'Token is not valid');
  }
};

export const createMemberToken = ({ memberId, teamId, tokenVersion = 0 }) => jwt.sign(
  { purpose: MEMBER_TOKEN_PURPOSE, teamId: String(teamId), ver: Number(tokenVersion) || 0 },
  jwtSecret(),
  {
    algorithm: 'HS256', subject: String(memberId), issuer: MEMBER_TOKEN_ISSUER,
    audience: MEMBER_TOKEN_AUDIENCE, expiresIn: '1h',
  },
);

export const verifyMemberToken = (request) => {
  const token = bearer(request);
  if (!token) throw new ApiError(401, 'Member authentication required');
  try {
    const decoded = jwt.verify(token, jwtSecret(), {
      algorithms: ['HS256'], issuer: MEMBER_TOKEN_ISSUER, audience: MEMBER_TOKEN_AUDIENCE,
    });
    if (decoded?.purpose !== MEMBER_TOKEN_PURPOSE
      || typeof decoded.sub !== 'string'
      || !mongoose.isObjectIdOrHexString(decoded.sub)
      || typeof decoded.teamId !== 'string'
      || !mongoose.isObjectIdOrHexString(decoded.teamId)) {
      throw new Error('Invalid member claims');
    }
    return decoded;
  } catch {
    throw new ApiError(401, 'Member token is not valid');
  }
};

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const createActivationToken = () => crypto.randomBytes(32).toString('base64url');
export const hashActivationToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

export const enforceRateLimit = async (request, scope, max, windowMs) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const windowStart = new Date(now);
  const expiresAt = new Date(now + windowMs);
  const cutoff = new Date(now - windowMs);
  const windowExpired = {
    $lte: [{ $ifNull: ['$windowStart', new Date(0)] }, cutoff],
  };
  const record = await RateLimit.findOneAndUpdate(
    { key },
    [{ $set: {
      windowStart: { $cond: [windowExpired, windowStart, '$windowStart'] },
      count: { $cond: [windowExpired, 1, { $add: [{ $ifNull: ['$count', 0] }, 1] }] },
      expiresAt: { $cond: [windowExpired, expiresAt, '$expiresAt'] },
    } }],
    { upsert: true, new: true },
  );
  if (record?.count > max) {
    throw new ApiError(429, 'Too many requests. Please try again later.');
  }
};
