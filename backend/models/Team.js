const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Executive', 'Faculty'
    image: { type: String }, // Cloudinary URL
    year: { type: String, required: true, default: '2025-26' }, // e.g., '2024-25'
    rank: { type: Number, default: 0 }, // For ordering within category
    socials: {
        linkedin: { type: String },
        github: { type: String },
        instagram: { type: String },
        twitter: { type: String }
    },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
