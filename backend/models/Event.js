const mongoose = require('mongoose');
const { MAX_HIGHLIGHTS, MAX_CAPTION_LENGTH, MAX_HIGHLIGHT_URL_LENGTH, isHighlightUrl } = require('../validation/event-highlights');

const highlightSchema = new mongoose.Schema({
    url: { type: String, required: true, maxlength: MAX_HIGHLIGHT_URL_LENGTH, validate: isHighlightUrl },
    caption: { type: String, maxlength: MAX_CAPTION_LENGTH }
}, { _id: false });

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    location: { type: String },
    description: { type: String },
    image: { type: String }, // Cloudinary URL
    highlights: {
        type: [highlightSchema],
        default: [],
        validate: value => Array.isArray(value) && value.length <= MAX_HIGHLIGHTS
    },
    category: { type: String, default: 'Upcoming' },
    registrationLink: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
