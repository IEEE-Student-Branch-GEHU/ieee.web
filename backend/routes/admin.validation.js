const mongoose = require('mongoose');
const { MAX_HIGHLIGHTS, MAX_CAPTION_LENGTH, isHighlightUrl } = require('../validation/event-highlights');
const {
  MAX_BIO_LENGTH,
  MAX_PROFILE_ARRAY_ITEM_LENGTH,
  MAX_PROFILE_ARRAY_ITEMS,
  MAX_PROFILE_STRING_LENGTH,
  PUBLIC_SOCIAL_KEYS,
  YEAR_PATTERN,
  isSafePublicUrl,
} = require('../validation/team-public');

class RequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestValidationError';
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
      throw new RequestValidationError('MongoDB operator and dotted keys are not allowed');
    }
    assertSafeKeys(value[key]);
  }
};

const assertObjectBody = (body) => {
  if (!isPlainObject(body)) {
    throw new RequestValidationError('Request body must be a JSON object');
  }
  assertSafeKeys(body);
};

const assertAllowedKeys = (body, allowedKeys) => {
  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      throw new RequestValidationError(`Unsupported field: ${key}`);
    }
  }
};

const optionalString = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new RequestValidationError(`${field} must be a string`);
  }
  return value;
};

const requiredString = (value, field) => {
  const result = optionalString(value, field);
  if (result === undefined || result.trim() === '') {
    throw new RequestValidationError(`${field} is required`);
  }
  return result;
};

const optionalNumber = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RequestValidationError(`${field} must be a number`);
  }
  return value;
};

const optionalBoolean = (value, field) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new RequestValidationError(`${field} must be a boolean`);
  }
  return value;
};

const optionalStringWithMax = (value, field, maxLength) => {
  const result = optionalString(value, field);
  if (result !== undefined && result.length > maxLength) {
    throw new RequestValidationError(`${field} must be at most ${maxLength} characters`);
  }
  return result;
};

const optionalPublicUrl = (value, field) => {
  const result = optionalString(value, field);
  if (result === undefined || result === '') return undefined;
  if (!isSafePublicUrl(result)) {
    throw new RequestValidationError(`${field} must be an absolute HTTP(S) URL without credentials`);
  }
  return result;
};

const optionalStringArray = (value, field) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > MAX_PROFILE_ARRAY_ITEMS) {
    throw new RequestValidationError(`${field} must be an array of at most ${MAX_PROFILE_ARRAY_ITEMS} strings`);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new RequestValidationError(`${field}[${index}] must be a string`);
    }
    const result = item;
    if (result.length > MAX_PROFILE_ARRAY_ITEM_LENGTH) {
      throw new RequestValidationError(`${field}[${index}] must be at most ${MAX_PROFILE_ARRAY_ITEM_LENGTH} characters`);
    }
    return result;
  });
};

const assertValidId = (id, resource) => {
  if (typeof id !== 'string' || !mongoose.isObjectIdOrHexString(id)) {
    throw new RequestValidationError(`Invalid ${resource} ID`);
  }
  return id;
};

const sanitizeCredentials = (body) => {
  assertObjectBody(body);
  assertAllowedKeys(body, new Set(['username', 'password']));

  return {
    username: requiredString(body.username, 'username'),
    password: requiredString(body.password, 'password'),
  };
};

const eventAllowedKeys = new Set([
  'title', 'date', 'time', 'location', 'description', 'image', 'category', 'registrationLink', 'highlights',
  // Accepted only to keep the existing Vite edit form compatible; never written back.
  '_id', 'id', '__v', 'createdAt',
]);

const highlightKeys = new Set(['url', 'caption']);
const sanitizeHighlights = (value) => {
  if (!Array.isArray(value) || value.length > MAX_HIGHLIGHTS) {
    throw new RequestValidationError(`highlights must be an array of at most ${MAX_HIGHLIGHTS} photos`);
  }

  return value.map((photo, index) => {
    if (!isPlainObject(photo)) {
      throw new RequestValidationError(`highlights[${index}] must be a photo object`);
    }
    assertAllowedKeys(photo, highlightKeys);
    const url = requiredString(photo.url, `highlights[${index}].url`).trim();
    if (!isHighlightUrl(url)) {
      throw new RequestValidationError(`highlights[${index}].url must be an absolute HTTP(S) URL without credentials (maximum 2048 characters)`);
    }
    const caption = optionalString(photo.caption, `highlights[${index}].caption`);
    if (caption !== undefined && caption.length > MAX_CAPTION_LENGTH) {
      throw new RequestValidationError(`Highlight captions must be at most ${MAX_CAPTION_LENGTH} characters`);
    }
    return caption === undefined ? { url } : { url, caption };
  });
};

const sanitizeEvent = (body, { partial = false } = {}) => {
  assertObjectBody(body);
  assertAllowedKeys(body, eventAllowedKeys);

  const result = {};
  const stringFields = ['title', 'date', 'time', 'location', 'description', 'image', 'category', 'registrationLink'];

  for (const field of stringFields) {
    if (body[field] !== undefined) result[field] = optionalString(body[field], field);
  }
  // Omission preserves existing photos on partial updates; [] explicitly clears the gallery.
  if (body.highlights !== undefined) result.highlights = sanitizeHighlights(body.highlights);

  if (!partial) {
    result.title = requiredString(body.title, 'title');
    result.date = requiredString(body.date, 'date');
  }

  if (Object.keys(result).length === 0) {
    throw new RequestValidationError('At least one editable event field is required');
  }

  return result;
};

const socialKeys = new Set(PUBLIC_SOCIAL_KEYS);
const teamAllowedKeys = new Set([
  'name', 'role', 'category', 'image', 'socials', 'order', 'bio', 'committee', 'academicYear', 'branch',
  'skills', 'interests', 'achievements', 'year', 'isLead', 'rank',
  // Legacy Vite fields are normalized into socials or intentionally discarded.
  'linkedin', 'instagram',
  // Accepted only for existing edit forms; never written back.
  '_id', 'id', '__v', 'createdAt',
]);

const sanitizeSocials = (value) => {
  if (value === undefined) return undefined;
  if (!isPlainObject(value)) {
    throw new RequestValidationError('socials must be an object');
  }
  assertAllowedKeys(value, socialKeys);

  const socials = {};
  for (const field of socialKeys) {
    if (value[field] !== undefined) {
      const url = optionalPublicUrl(value[field], `socials.${field}`);
      if (url !== undefined) socials[field] = url;
    }
  }
  return socials;
};

const sanitizeTeam = (body, { partial = false } = {}) => {
  assertObjectBody(body);
  assertAllowedKeys(body, teamAllowedKeys);

  const result = {};
  for (const field of ['name', 'role', 'category', 'image']) {
    if (body[field] !== undefined) {
      const value = field === 'image'
        ? optionalPublicUrl(body[field], field)
        : optionalString(body[field], field);
      if (value !== undefined) result[field] = value;
    }
  }
  if (!partial) {
    result.name = requiredString(body.name, 'name');
    result.role = requiredString(body.role, 'role');
    result.category = requiredString(body.category, 'category');
  }

  if (body.bio !== undefined) result.bio = optionalStringWithMax(body.bio, 'bio', MAX_BIO_LENGTH);
  for (const field of ['committee', 'academicYear', 'branch']) {
    if (body[field] !== undefined) result[field] = optionalStringWithMax(body[field], field, MAX_PROFILE_STRING_LENGTH);
  }
  for (const field of ['skills', 'interests', 'achievements']) {
    if (body[field] !== undefined) result[field] = optionalStringArray(body[field], field);
  }
  if (body.year !== undefined) {
    const year = optionalString(body.year, 'year');
    if (!YEAR_PATTERN.test(year)) throw new RequestValidationError('year must use YYYY-YYYY format');
    result.year = year;
  }
  if (body.isLead !== undefined) result.isLead = optionalBoolean(body.isLead, 'isLead');
  if (body.rank !== undefined) result.rank = optionalNumber(body.rank, 'rank');

  const socials = sanitizeSocials(body.socials);
  const legacyLinkedin = optionalPublicUrl(body.linkedin, 'linkedin');
  const legacyInstagram = optionalPublicUrl(body.instagram, 'instagram');
  if (legacyLinkedin !== undefined || legacyInstagram !== undefined) {
    result.socials = {
      ...(socials || {}),
      ...(legacyLinkedin === undefined ? {} : { linkedin: legacyLinkedin }),
      ...(legacyInstagram === undefined ? {} : { instagram: legacyInstagram }),
    };
  } else if (socials !== undefined) {
    result.socials = socials;
  }

  if (body.order !== undefined) result.order = optionalNumber(body.order, 'order');
  if (Object.keys(result).length === 0) {
    throw new RequestValidationError('At least one editable team field is required');
  }

  return result;
};

module.exports = {
  RequestValidationError,
  assertValidId,
  sanitizeCredentials,
  sanitizeEvent,
  sanitizeTeam,
};
