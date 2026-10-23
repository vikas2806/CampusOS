const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['admin', 'organiser', 'volunteer'],
    default: 'organiser',
  },
  joinedAt: { type: Date, default: Date.now },
});

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      maxlength: [120, 'Club name too long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    institution: { type: String, default: '' },
    city: { type: String, default: 'Mumbai' },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    plan: {
      type: String,
      enum: ['free', 'event_pro', 'club', 'institution'],
      default: 'free',
    },
    planExpiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// auto-generate slug from name
clubSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 6);
  }
  next();
});

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
