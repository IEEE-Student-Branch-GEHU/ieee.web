const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Executive', 'Faculty'
    image: { type: String }, // Cloudinary URL
    socials: {
        linkedin: String,
        instagram: String,
        github: String,
        twitter: String
    },
    year: { type: String, default: '2025-26' },
    rank: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
