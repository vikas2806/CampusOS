const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'select', 'checkbox', 'textarea'],
    default: 'text',
  },
  options: [String], // for select type
  required: { type: Boolean, default: false },
});

const scheduleItemSchema = new mongoose.Schema({
  time: String,
  title: String,
  description: String,
});

const eventSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    banner: { type: String, default: '' },
    venue: { type: String, default: '' },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date },
    registrationDeadline: { type: Date },
    capacity: { type: Number, default: 0 }, // 0 = unlimited
    rules: { type: String, default: '' },
    schedule: [scheduleItemSchema],
    customFields: [customFieldSchema],
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    plan: {
      type: String,
      enum: ['free', 'event_pro', 'club', 'institution'],
      default: 'free',
    },
    // denormalized count for quick reads
    registrationCount: { type: Number, default: 0 },
    attendanceCount: { type: Number, default: 0 },
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String, default: '' },
  },
  { timestamps: true }
);

// auto-generate slug from title
eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 7);
  }
  next();
});

eventSchema.index({ club: 1, status: 1 });
eventSchema.index({ slug: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
