const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    index: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  issuer: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  issuedAt: Date,
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
    required: true,
  },
  storage: {
    publicId: { type: String, required: true, select: false },
    resourceType: { type: String, default: 'auto', select: false },
    format: { type: String, select: false },
    bytes: { type: Number, select: false },
  },
}, { timestamps: true });

certificateSchema.index({ memberId: 1, createdAt: -1 });
certificateSchema.index({ teamId: 1, visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
