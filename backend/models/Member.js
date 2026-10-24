const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 64,
    match: /^[a-z0-9][a-z0-9._-]{2,63}$/,
  },
  passwordHash: {
    type: String,
    select: false,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'disabled'],
    default: 'pending',
    required: true,
  },
  activationTokenHash: {
    type: String,
    select: false,
  },
  activationExpiresAt: {
    type: Date,
    select: false,
  },
  tokenVersion: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

memberSchema.index({ teamId: 1 }, { unique: true });
memberSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);
