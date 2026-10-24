const mongoose = require('mongoose');
const {
  MAX_BIO_LENGTH,
  MAX_PROFILE_ARRAY_ITEM_LENGTH,
  MAX_PROFILE_ARRAY_ITEMS,
  MAX_PROFILE_STRING_LENGTH,
  PUBLIC_SOCIAL_KEYS,
  YEAR_PATTERN,
  isSafePublicUrl,
} = require('../validation/team-public');
const {
  MEMBER_PASSWORD_MAX_LENGTH,
  MEMBER_PASSWORD_MIN_LENGTH,
  isValidMemberUsername,
  normalizeMemberUsername,
} = require('../services/member-auth');

class MemberRequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MemberRequestValidationError';
  }
}

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const assertSafeKeys = (value) => {
  if (Array.isArray(value)) {
    value.forEach(assertSafeKeys);
    return;
  }
  if (!isPlainObject(value)) return;

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new MemberRequestValidationError('MongoDB operator and dotted keys are not allowed');
    }
    assertSafeKeys(value[key]);
  }
};

const assertObjectBody = (body) => {
  if (!isPlainObject(body)) {
    throw new MemberRequestValidationError('Request body must be a JSON object');
  }
  assertSafeKeys(body);
};

const assertAllowedKeys = (body, allowedKeys) => {
  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) throw new MemberRequestValidationError(`Unsupported field: ${key}`);
  }
};

const requiredString = (value, field, { maxLength = 4096 } = {}) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new MemberRequestValidationError(`${field} is required`);
  }
  if (value.length > maxLength) {
    throw new MemberRequestValidationError(`${field} must be at most ${maxLength} characters`);
  }
  return value.trim();
};

const optionalString = (value, field, maxLength) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new MemberRequestValidationError(`${field} must be a string`);
  if (value.length > maxLength) throw new MemberRequestValidationError(`${field} must be at most ${maxLength} characters`);
  return value.trim();
};

const optionalStringArray = (value, field) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > MAX_PROFILE_ARRAY_ITEMS) {
    throw new MemberRequestValidationError(`${field} must be an array of at most ${MAX_PROFILE_ARRAY_ITEMS} strings`);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') throw new MemberRequestValidationError(`${field}[${index}] must be a string`);
    const normalized = item.trim();
    if (normalized.length > MAX_PROFILE_ARRAY_ITEM_LENGTH) {
      throw new MemberRequestValidationError(`${field}[${index}] must be at most ${MAX_PROFILE_ARRAY_ITEM_LENGTH} characters`);
    }
    return normalized;
  }).filter(Boolean);
};

const sanitizeSocials = (value) => {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) throw new MemberRequestValidationError('socials must be an object');
  assertAllowedKeys(value, new Set(PUBLIC_SOCIAL_KEYS));

  const socials = {};
  for (const key of PUBLIC_SOCIAL_KEYS) {
    if (value[key] === undefined || value[key] === '') continue;
    if (typeof value[key] !== 'string' || !isSafePublicUrl(value[key])) {
      throw new MemberRequestValidationError(`socials.${key} must be an absolute HTTP(S) URL without credentials`);
    }
    socials[key] = value[key];
  }
  return socials;
};

const sanitizeMemberCredentials = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['username', 'password']));
  const username = normalizeMemberUsername(requiredString(body.username, 'username', { maxLength: 64 }));
  if (!isValidMemberUsername(username)) {
    throw new MemberRequestValidationError('username must contain 3-64 lowercase letters, numbers, dots, underscores, or hyphens');
  }
  if (typeof body.password !== 'string' || body.password.length === 0 || body.password.length > 128) {
    throw new MemberRequestValidationError('password is required and must be at most 128 characters');
  }
  return { username, password: body.password };
};

const sanitizeMemberActivation = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['token', 'password']));
  if (typeof body.password !== 'string'
    || body.password.length < MEMBER_PASSWORD_MIN_LENGTH
    || body.password.length > MEMBER_PASSWORD_MAX_LENGTH
    || body.password.trim() === '') {
    throw new MemberRequestValidationError(`password must be between ${MEMBER_PASSWORD_MIN_LENGTH} and ${MEMBER_PASSWORD_MAX_LENGTH} characters`);
  }
  return {
    token: requiredString(body.token, 'token', { maxLength: 256 }),
    password: body.password,
  };
};

const sanitizeProvisioning = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['username', 'teamId']));
  const username = normalizeMemberUsername(requiredString(body.username, 'username', { maxLength: 64 }));
  if (!isValidMemberUsername(username)) {
    throw new MemberRequestValidationError('username must contain 3-64 lowercase letters, numbers, dots, underscores, or hyphens');
  }
  return { username, teamId: assertValidId(body.teamId, 'team') };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeGoogleAuthorization = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['email']));
  const email = requiredString(body.email, 'email', { maxLength: 254 }).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new MemberRequestValidationError('email must be a valid email address');
  return { email };
};

const sanitizeGoogleCredential = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['credential']));
  return { credential: requiredString(body.credential, 'credential', { maxLength: 4096 }) };
};

const sanitizeMemberProfileUpdate = (body) => {
  assertObjectBody(body);
  const allowedKeys = new Set([
    'bio', 'committee', 'academicYear', 'branch', 'skills', 'interests', 'achievements', 'socials',
  ]);
  assertAllowedKeys(body, allowedKeys);

  const result = {};
  if (body.bio !== undefined) result.bio = optionalString(body.bio, 'bio', MAX_BIO_LENGTH);
  for (const field of ['committee', 'academicYear', 'branch']) {
    if (body[field] !== undefined) result[field] = optionalString(body[field], field, MAX_PROFILE_STRING_LENGTH);
  }
  for (const field of ['skills', 'interests', 'achievements']) {
    if (body[field] !== undefined) result[field] = optionalStringArray(body[field], field);
  }
  if (body.socials !== undefined) result.socials = sanitizeSocials(body.socials);

  if (Object.keys(result).length === 0) {
    throw new MemberRequestValidationError('At least one editable profile field is required');
  }
  return result;
};

const sanitizeCertificateMetadata = (body, { partial = false } = {}) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['title', 'issuer', 'issuedAt', 'visibility']));

  const result = {};
  if (body.title !== undefined) result.title = requiredString(body.title, 'title', { maxLength: 160 });
  if (!partial && result.title === undefined) throw new MemberRequestValidationError('title is required');
  if (body.issuer !== undefined) result.issuer = optionalString(body.issuer, 'issuer', 160);
  if (body.issuedAt !== undefined && body.issuedAt !== '') {
    const value = requiredString(body.issuedAt, 'issuedAt', { maxLength: 40 });
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new MemberRequestValidationError('issuedAt must be a valid date');
    result.issuedAt = parsed;
  } else if (body.issuedAt === '') {
    result.issuedAt = null;
  }
  if (body.visibility !== undefined) {
    if (body.visibility !== 'private' && body.visibility !== 'public') {
      throw new MemberRequestValidationError('visibility must be private or public');
    }
    result.visibility = body.visibility;
  }
  if (Object.keys(result).length === 0) {
    throw new MemberRequestValidationError('At least one certificate field is required');
  }
  return result;
};

const assertValidId = (id, resource) => {
  if (typeof id !== 'string' || !mongoose.isObjectIdOrHexString(id)) {
    throw new MemberRequestValidationError(`Invalid ${resource} ID`);
  }
  return id;
};

module.exports = {
  MemberRequestValidationError,
  assertAllowedKeys,
  assertObjectBody,
  assertSafeKeys,
  assertValidId,
  sanitizeCertificateMetadata,
  sanitizeMemberActivation,
  sanitizeMemberCredentials,
  sanitizeMemberProfileUpdate,
  sanitizeGoogleAuthorization,
  sanitizeGoogleCredential,
  sanitizeProvisioning,
  sanitizeSocials,
};
