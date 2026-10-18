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
    category: { type: String, required: true }, // e.g., 'Executive', 'Faculty'
    image: { ...publicUrl }, // Cloudinary URL
    socials: { type: socialsSchema },
    bio: { type: String, maxlength: MAX_BIO_LENGTH },
    committee: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    academicYear: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    branch: { type: String, maxlength: MAX_PROFILE_STRING_LENGTH },
    skills: boundedStringArray(),
    interests: boundedStringArray(),
    achievements: boundedStringArray(),
    year: { type: String, match: YEAR_PATTERN },
    isLead: { type: Boolean },
    rank: { type: Number },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
