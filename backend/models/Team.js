const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Executive', 'Faculty'
    image: { type: String }, // Cloudinary URL
    year: { type: String, required: true, default: '2023-2024' }, // e.g., '2023-2024'
    rank: { type: Number, default: 0 }, // For custom sorting
    isLead: { type: Boolean, default: false }, // For highlighting leads
    email: { type: String }, // Optional contact info
    socials: {
        linkedin: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        github: { type: String }
    },
    order: { type: Number, default: 0 },
    onLandingPage: { type: Boolean, default: false },
    bio: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
