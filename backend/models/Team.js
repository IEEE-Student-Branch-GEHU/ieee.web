const mongoose = require('mongoose');
const {
    MAX_BIO_LENGTH,
    MAX_PROFILE_ARRAY_ITEM_LENGTH,
    MAX_PROFILE_ARRAY_ITEMS,
    MAX_PROFILE_STRING_LENGTH,
    MAX_PUBLIC_URL_LENGTH,
    PUBLIC_SOCIAL_KEYS,
    isSafePublicUrl,
    YEAR_PATTERN,
} = require('../validation/team-public');

const publicUrl = {
    type: String,
    maxlength: MAX_PUBLIC_URL_LENGTH,
    validate: {
        validator: isSafePublicUrl,
        message: 'Public links must be absolute HTTP(S) URLs without credentials',
    },
};

const socialsSchema = new mongoose.Schema(
    Object.fromEntries(PUBLIC_SOCIAL_KEYS.map((field) => [field, publicUrl])),
    { _id: false },
);

const boundedStringArray = () => ({
    type: [{ type: String, maxlength: MAX_PROFILE_ARRAY_ITEM_LENGTH }],
    default: undefined,
    validate: {
        validator: (value) => Array.isArray(value) && value.length <= MAX_PROFILE_ARRAY_ITEMS,
        message: `Profile lists may contain at most ${MAX_PROFILE_ARRAY_ITEMS} items`,
    },
});

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    // Category remains open for compatibility with existing lowercase and
    // historical values used by the admin UI and archive records.
    category: { type: String, required: true },
    image: { ...publicUrl }, // Cloudinary URL
    socials: { type: socialsSchema },
    bio: { type: String, maxlength: MAX_BIO_LENGTH },
    committee: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    academicYear: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    branch: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    skills: boundedStringArray(),
    interests: boundedStringArray(),
    achievements: boundedStringArray(),
    // New records require a full academic year. Existing records without a
    // year remain loadable, and partial updates may omit the legacy field.
    year: {
        type: String,
        required: function requiredForNewRecord() { return this.isNew; },
        match: YEAR_PATTERN,
    },
    isLead: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    // Used only to select profiles shown on the landing page; public profile
    // serialization remains limited to the approved member fields.
    onLandingPage: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
