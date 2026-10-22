import mongoose from 'mongoose';
import { ApiError } from './security';

export const PUBLIC_SOCIAL_KEYS = ['linkedin', 'twitter', 'instagram', 'github'];
export const YEAR_PATTERN = /^\d{4}-\d{4}$/;
const MAX_ITEMS = 20;
const MAX_ITEM_LENGTH = 120;
const MEMBER_USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,63}$/;
const MEMBER_PASSWORD_MIN_LENGTH = 12;
const MEMBER_PASSWORD_MAX_LENGTH = 128;

const isPlainObject = (value) => value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

const assertSafeKeys = (value) => {
  if (Array.isArray(value)) return value.forEach(assertSafeKeys);
  if (!isPlainObject(value)) return;
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) throw new ApiError(400, 'MongoDB operator and dotted keys are not allowed');
    assertSafeKeys(value[key]);
  }
};

export const assertObject = (body) => {
  if (!isPlainObject(body)) throw new ApiError(400, 'Request body must be a JSON object');
  assertSafeKeys(body);
};

const allowedKeys = (body, allowed) => {
  for (const key of Object.keys(body)) if (!allowed.has(key)) throw new ApiError(400, `Unsupported field: ${key}`);
};

const optionalString = (value, field, max = 4096) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new ApiError(400, `${field} must be a string`);
  if (value.length > max) throw new ApiError(400, `${field} must be at most ${max} characters`);
  return value.trim();
};

const requiredString = (value, field, max = 4096) => {
  const result = optionalString(value, field, max);
  if (!result) throw new ApiError(400, `${field} is required`);
  return result;
};

const optionalBoolean = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new ApiError(400, `${field} must be a boolean`);
  return value;
};

const optionalNumber = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new ApiError(400, `${field} must be a number`);
  return value;
};

const publicUrl = (value, field) => {
  const result = optionalString(value, field, 2048);
  if (result === undefined || result === '') return undefined;
  try {
    const parsed = new URL(result);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || /\s/.test(result)) throw new Error();
  } catch {
    throw new ApiError(400, `${field} must be an absolute HTTP(S) URL without credentials`);
  }
  return result;
};

const stringArray = (value, field) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > MAX_ITEMS) throw new ApiError(400, `${field} must be an array of at most ${MAX_ITEMS} strings`);
  return value.map((item, index) => {
    if (typeof item !== 'string') throw new ApiError(400, `${field}[${index}] must be a string`);
    const normalized = item.trim();
    if (normalized.length > MAX_ITEM_LENGTH) throw new ApiError(400, `${field}[${index}] must be at most ${MAX_ITEM_LENGTH} characters`);
    return normalized;
  }).filter(Boolean);
};

export const sanitizeSocials = (value) => {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) throw new ApiError(400, 'socials must be an object');
  allowedKeys(value, new Set(PUBLIC_SOCIAL_KEYS));
  const result = {};
  for (const field of PUBLIC_SOCIAL_KEYS) {
    const url = publicUrl(value[field], `socials.${field}`);
    if (url) result[field] = url;
  }
  return result;
};

export const sanitizeTeam = (body, { partial = false } = {}) => {
  assertObject(body);
  allowedKeys(body, new Set([
    'name', 'role', 'category', 'image', 'socials', 'order', 'bio', 'committee', 'academicYear', 'branch',
    'skills', 'interests', 'achievements', 'year', 'isLead', 'rank', 'onLandingPage', 'linkedin', 'instagram',
    '_id', 'id', '__v', 'createdAt',
  ]));
  const result = {};
  for (const field of ['name', 'role', 'category']) {
    const value = body[field] === undefined && !partial ? requiredString(body[field], field) : optionalString(body[field], field);
    if (value !== undefined) result[field] = value;
  }
  if (body.image !== undefined) result.image = publicUrl(body.image, 'image');
  if (body.bio !== undefined) result.bio = optionalString(body.bio, 'bio', 2000);
  for (const field of ['committee', 'academicYear', 'branch']) if (body[field] !== undefined) result[field] = optionalString(body[field], field, 120);
  for (const field of ['skills', 'interests', 'achievements']) if (body[field] !== undefined) result[field] = stringArray(body[field], field);
  const year = partial ? optionalString(body.year, 'year') : requiredString(body.year, 'year');
  if (year !== undefined) {
    if (!YEAR_PATTERN.test(year)) throw new ApiError(400, 'year must use YYYY-YYYY format');
    result.year = year;
  }
  if (body.isLead !== undefined) result.isLead = optionalBoolean(body.isLead, 'isLead');
  if (body.rank !== undefined) result.rank = optionalNumber(body.rank, 'rank');
  if (body.order !== undefined) result.order = optionalNumber(body.order, 'order');
  if (body.onLandingPage !== undefined) result.onLandingPage = optionalBoolean(body.onLandingPage, 'onLandingPage');

  const socials = sanitizeSocials(body.socials);
  const linkedin = publicUrl(body.linkedin, 'linkedin');
  const instagram = publicUrl(body.instagram, 'instagram');
  if (socials || linkedin || instagram) result.socials = { ...(socials || {}), ...(linkedin ? { linkedin } : {}), ...(instagram ? { instagram } : {}) };
  if (Object.keys(result).length === 0) throw new ApiError(400, 'At least one editable team field is required');
  return result;
};

export const sanitizeEvent = (body, { partial = false } = {}) => {
  assertObject(body);
  allowedKeys(body, new Set(['title', 'date', 'time', 'location', 'description', 'image', 'category', 'registrationLink', 'highlights', 'onLandingPage', '_id', 'id', '__v', 'createdAt']));
  const result = {};
  for (const field of ['title', 'date', 'time', 'location', 'description', 'image', 'category', 'registrationLink']) {
    if (body[field] !== undefined) result[field] = optionalString(body[field], field);
  }
  if (!partial) {
    result.title = requiredString(body.title, 'title');
    result.date = requiredString(body.date, 'date');
  }
  if (body.onLandingPage !== undefined) result.onLandingPage = optionalBoolean(body.onLandingPage, 'onLandingPage');
  if (body.highlights !== undefined) {
    if (!Array.isArray(body.highlights) || body.highlights.length > 50) throw new ApiError(400, 'highlights must be an array of at most 50 photos');
    result.highlights = body.highlights.map((photo, index) => {
      if (!isPlainObject(photo)) throw new ApiError(400, `highlights[${index}] must be a photo object`);
      allowedKeys(photo, new Set(['url', 'caption']));
      const url = publicUrl(photo.url, `highlights[${index}].url`);
      if (!url) throw new ApiError(400, `highlights[${index}].url is required`);
      const caption = optionalString(photo.caption, `highlights[${index}].caption`, 300);
      return caption === undefined ? { url } : { url, caption };
    });
  }
  if (Object.keys(result).length === 0) throw new ApiError(400, 'At least one editable event field is required');
  return result;
};

export const sanitizeCredentials = (body) => {
  assertObject(body);
  allowedKeys(body, new Set(['username', 'password']));
  return { username: requiredString(body.username, 'username', 64).toLowerCase(), password: requiredString(body.password, 'password', 128) };
};

export const normalizeMemberUsername = (value) => requiredString(value, 'username', 64).toLowerCase();
export const sanitizeMemberCredentials = (body) => {
  assertObject(body);
  allowedKeys(body, new Set(['username', 'password']));
  const username = normalizeMemberUsername(body.username);
  if (!MEMBER_USERNAME_PATTERN.test(username)) {
    throw new ApiError(400, 'username must contain 3-64 lowercase letters, numbers, dots, underscores, or hyphens');
  }
  if (typeof body.password !== 'string' || body.password.length === 0 || body.password.length > MEMBER_PASSWORD_MAX_LENGTH) {
    throw new ApiError(400, `password is required and must be at most ${MEMBER_PASSWORD_MAX_LENGTH} characters`);
  }
  return { username, password: body.password };
};
export const sanitizeMemberActivation = (body) => {
  assertObject(body);
  allowedKeys(body, new Set(['token', 'password']));
  const password = body.password;
  if (typeof password !== 'string'
    || password.length < MEMBER_PASSWORD_MIN_LENGTH
    || password.length > MEMBER_PASSWORD_MAX_LENGTH
    || password.trim() === '') {
    throw new ApiError(400, `password must be between ${MEMBER_PASSWORD_MIN_LENGTH} and ${MEMBER_PASSWORD_MAX_LENGTH} characters`);
  }
  return { token: requiredString(body.token, 'token', 256), password };
};
export const sanitizeProvisioning = (body) => {
  assertObject(body);
  allowedKeys(body, new Set(['username', 'teamId']));
  if (!mongoose.isObjectIdOrHexString(body.teamId)) throw new ApiError(400, 'Invalid team ID');
  const username = normalizeMemberUsername(body.username);
  if (!MEMBER_USERNAME_PATTERN.test(username)) {
    throw new ApiError(400, 'username must contain 3-64 lowercase letters, numbers, dots, underscores, or hyphens');
  }
  return { username, teamId: body.teamId };
};
export const sanitizeMemberProfile = (body) => {
  assertObject(body);
  allowedKeys(body, new Set(['bio', 'committee', 'academicYear', 'branch', 'skills', 'interests', 'achievements', 'socials']));
  const result = {};
  if (body.bio !== undefined) result.bio = optionalString(body.bio, 'bio', 2000);
  for (const field of ['committee', 'academicYear', 'branch']) if (body[field] !== undefined) result[field] = optionalString(body[field], field, 120);
  for (const field of ['skills', 'interests', 'achievements']) if (body[field] !== undefined) result[field] = stringArray(body[field], field);
  if (body.socials !== undefined) result.socials = sanitizeSocials(body.socials);
  if (Object.keys(result).length === 0) throw new ApiError(400, 'At least one editable profile field is required');
  return result;
};
export const sanitizeCertificate = (body, { partial = false } = {}) => {
  assertObject(body);
  allowedKeys(body, new Set(['title', 'issuer', 'issuedAt', 'visibility']));
  const result = {};
  if (body.title !== undefined) result.title = requiredString(body.title, 'title', 160);
  if (!partial && !result.title) throw new ApiError(400, 'title is required');
  if (body.issuer !== undefined) result.issuer = optionalString(body.issuer, 'issuer', 160);
  if (body.issuedAt !== undefined) {
    if (body.issuedAt === '') result.issuedAt = null;
    else { const date = new Date(requiredString(body.issuedAt, 'issuedAt', 40)); if (Number.isNaN(date.getTime())) throw new ApiError(400, 'issuedAt must be a valid date'); result.issuedAt = date; }
  }
  if (body.visibility !== undefined) {
    if (!['private', 'public'].includes(body.visibility)) throw new ApiError(400, 'visibility must be private or public');
    result.visibility = body.visibility;
  }
  if (Object.keys(result).length === 0) throw new ApiError(400, 'At least one certificate field is required');
  return result;
};

export const assertId = (value, label) => {
  if (!mongoose.isObjectIdOrHexString(value)) throw new ApiError(400, `Invalid ${label} ID`);
  return value;
};

const source = (value) => value && typeof value.toObject === 'function' ? value.toObject({ virtuals: false }) : (value || {});
const safeUrl = (value) => { try { const url = new URL(value); return typeof value === 'string' && /^https?:\/\//i.test(value) && !url.username && !url.password && !/\s/.test(value); } catch { return false; } };

export const serializeTeam = (member) => {
  const item = source(member);
  const result = {};
  if (item._id !== undefined) result._id = item._id;
  for (const field of ['name', 'role', 'category', 'bio', 'committee', 'academicYear', 'branch']) if (typeof item[field] === 'string') result[field] = item[field];
  if (safeUrl(item.image)) result.image = item.image;
  if (item.socials && typeof item.socials === 'object') {
    const socials = {};
    for (const field of PUBLIC_SOCIAL_KEYS) if (safeUrl(item.socials[field])) socials[field] = item.socials[field];
    if (Object.keys(socials).length) result.socials = socials;
  }
  for (const field of ['skills', 'interests', 'achievements']) if (Array.isArray(item[field])) result[field] = item[field].filter(v => typeof v === 'string').slice(0, MAX_ITEMS);
  if (typeof item.year === 'string' && YEAR_PATTERN.test(item.year)) result.year = item.year;
  if (typeof item.isLead === 'boolean') result.isLead = item.isLead;
  if (typeof item.rank === 'number' && Number.isFinite(item.rank)) result.rank = item.rank;
  return result;
};

export const serializeCertificate = (certificate, downloadUrl) => {
  const item = source(certificate);
  const result = {};
  for (const field of ['_id', 'title', 'issuer', 'issuedAt', 'visibility', 'createdAt']) if (item[field] !== undefined) result[field] = item[field];
  if (downloadUrl) result.downloadUrl = downloadUrl;
  return result;
};
