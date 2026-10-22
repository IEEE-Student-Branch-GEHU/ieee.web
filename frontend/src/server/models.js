import mongoose from 'mongoose';

const { Schema } = mongoose;

const publicUrl = {
  type: String,
  maxlength: 2048,
};

const teamSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true },
  image: publicUrl,
  socials: {
    type: new Schema({
      linkedin: publicUrl,
      twitter: publicUrl,
      instagram: publicUrl,
      github: publicUrl,
    }, { _id: false }),
  },
  bio: { type: String, maxlength: 2000 },
  committee: { type: String, maxlength: 120 },
  academicYear: { type: String, maxlength: 120 },
  branch: { type: String, maxlength: 120 },
  skills: [{ type: String, maxlength: 120 }],
  interests: [{ type: String, maxlength: 120 }],
  achievements: [{ type: String, maxlength: 120 }],
  year: {
    type: String,
    required() { return this.isNew; },
    match: /^\d{4}-\d{4}$/,
  },
  isLead: { type: Boolean, default: false },
  rank: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  onLandingPage: { type: Boolean, default: false },
}, { timestamps: true, collection: 'teams' });

const highlightSchema = new Schema({
  url: { type: String, required: true, maxlength: 2048 },
  caption: { type: String, maxlength: 300 },
}, { _id: false });

const eventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: String,
  location: String,
  description: String,
  image: String,
  highlights: { type: [highlightSchema], default: [] },
  category: { type: String, default: 'Upcoming' },
  registrationLink: String,
  onLandingPage: { type: Boolean, default: false },
}, { timestamps: true, collection: 'events' });

const adminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { collection: 'admins' });

const memberSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, ref: 'NextTeam', required: true, unique: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  status: { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending', required: true },
  activationTokenHash: { type: String, select: false },
  activationExpiresAt: { type: Date, select: false },
  tokenVersion: { type: Number, default: 0, min: 0 },
}, { timestamps: true, collection: 'members' });

const certificateSchema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'NextMember', required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'NextTeam', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  issuer: { type: String, trim: true, maxlength: 160 },
  issuedAt: Date,
  visibility: { type: String, enum: ['private', 'public'], default: 'private', required: true },
  storage: {
    publicId: { type: String, required: true, select: false },
    resourceType: { type: String, default: 'auto', select: false },
    format: { type: String, select: false },
    bytes: { type: Number, select: false },
  },
}, { timestamps: true, collection: 'certificates' });

const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { collection: 'apiRateLimits' });

export const Team = mongoose.models.NextTeam || mongoose.model('NextTeam', teamSchema);
export const Event = mongoose.models.NextEvent || mongoose.model('NextEvent', eventSchema);
export const Admin = mongoose.models.NextAdmin || mongoose.model('NextAdmin', adminSchema);
export const Member = mongoose.models.NextMember || mongoose.model('NextMember', memberSchema);
export const Certificate = mongoose.models.NextCertificate || mongoose.model('NextCertificate', certificateSchema);
export const RateLimit = mongoose.models.NextRateLimit || mongoose.model('NextRateLimit', rateLimitSchema);
