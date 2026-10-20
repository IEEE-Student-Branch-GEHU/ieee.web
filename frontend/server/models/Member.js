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
  // Google account email an administrator authorized for volunteer sign-in.
  email: {
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  // Google's stable account ID, bound on the first Google sign-in so a
  // re-assigned email address cannot take over the account.
  googleSubject: {
    type: String,
    select: false,
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
memberSchema.index({ email: 1 }, { unique: true, sparse: true });
memberSchema.index({ googleSubject: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Member', memberSchema);
