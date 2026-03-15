const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Executive', 'Faculty'
    image: { type: String }, // Cloudinary URL
    socials: {
        linkedin: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        github: { type: String }
    },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
