const PUBLIC_SOCIAL_KEYS = Object.freeze(['linkedin', 'twitter', 'instagram', 'github']);
const PUBLIC_TEAM_FIELDS = Object.freeze([
  '_id',
  'name',
  'role',
  'category',
  'image',
  'socials',
  'bio',
  'committee',
  'academicYear',
  'branch',
  'skills',
  'interests',
  'achievements',
  'year',
  'isLead',
  'rank',
]);

const PUBLIC_TEAM_PROJECTION = PUBLIC_TEAM_FIELDS.join(' ');
// order is selected only for the list's legacy ordering fallback; the
// serializer never returns it.
const TEAM_LIST_PROJECTION = [...PUBLIC_TEAM_FIELDS, 'order'].join(' ');
const MAX_PUBLIC_URL_LENGTH = 2048;
const MAX_BIO_LENGTH = 2000;
const MAX_PROFILE_STRING_LENGTH = 120;
const MAX_PROFILE_ARRAY_ITEMS = 20;
const MAX_PROFILE_ARRAY_ITEM_LENGTH = 120;
const YEAR_PATTERN = /^\d{4}-\d{4}$/;

const isSafePublicUrl = (value) => {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > MAX_PUBLIC_URL_LENGTH
    || /\s/.test(value)
    || !/^https?:\/\//i.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password;
  } catch {
    return false;
  }
};

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const sourceOf = (member) => {
  if (member && typeof member.toObject === 'function') {
    return member.toObject({ virtuals: false });
  }
  return member || {};
};

const addStringField = (result, source, field, maxLength) => {
  if (typeof source[field] === 'string' && source[field].length <= maxLength) {
    result[field] = source[field];
  }
};

const addPublicArray = (result, source, field) => {
  if (!Array.isArray(source[field]) || source[field].length > MAX_PROFILE_ARRAY_ITEMS) return;
  if (!source[field].every((value) => (
    typeof value === 'string' && value.length <= MAX_PROFILE_ARRAY_ITEM_LENGTH
  ))) return;
  result[field] = [...source[field]];
};

const serializePublicTeamMember = (member) => {
  const source = sourceOf(member);
  const result = {};

  if (source._id !== undefined) result._id = source._id;
  for (const field of ['name', 'role', 'category']) addStringField(result, source, field, Number.MAX_SAFE_INTEGER);

  if (isSafePublicUrl(source.image)) result.image = source.image;

  if (isPlainObject(source.socials)) {
    const socials = {};
    for (const field of PUBLIC_SOCIAL_KEYS) {
      if (isSafePublicUrl(source.socials[field])) socials[field] = source.socials[field];
    }
    if (Object.keys(socials).length > 0) result.socials = socials;
  }

  addStringField(result, source, 'bio', MAX_BIO_LENGTH);
  for (const field of ['committee', 'academicYear', 'branch']) {
    addStringField(result, source, field, MAX_PROFILE_STRING_LENGTH);
  }
  for (const field of ['skills', 'interests', 'achievements']) addPublicArray(result, source, field);

  if (typeof source.year === 'string' && YEAR_PATTERN.test(source.year)) result.year = source.year;
  if (typeof source.isLead === 'boolean') result.isLead = source.isLead;
  if (typeof source.rank === 'number' && Number.isFinite(source.rank)) result.rank = source.rank;

  return result;
};

module.exports = {
  MAX_BIO_LENGTH,
  MAX_PROFILE_ARRAY_ITEM_LENGTH,
  MAX_PROFILE_ARRAY_ITEMS,
  MAX_PROFILE_STRING_LENGTH,
  MAX_PUBLIC_URL_LENGTH,
  PUBLIC_SOCIAL_KEYS,
  PUBLIC_TEAM_FIELDS,
  PUBLIC_TEAM_PROJECTION,
  TEAM_LIST_PROJECTION,
  YEAR_PATTERN,
  isSafePublicUrl,
  serializePublicTeamMember,
};
