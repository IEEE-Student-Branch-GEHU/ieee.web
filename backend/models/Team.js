const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['EXECUTIVE', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'MEDIA', 'LEADS']
    },
    image: { type: String },
    year: {
        type: String,
        required: true,
        default: '2025-26',
        match: [/^\d{4}-\d{2,4}$/, 'Year must be in YYYY-YY or YYYY-YYYY format'],
    },
    rank: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isLead: { type: Boolean, default: false },
    onLandingPage: { type: Boolean, default: false },
    email: { type: String },
    bio: { type: String },
    socials: {
        linkedin: String,
        instagram: String,
        github: String,
        twitter: String
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
