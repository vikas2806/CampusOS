const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // for logged-in users
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // participant info (filled even without login)
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '' },
    // answers to event's customFields
    answers: [
      {
        label: String,
        value: String,
      },
    ],
    // QR token signed with QR_SECRET
    qrToken: { type: String, unique: true },
    qrCode: { type: String }, // base64 QR image
    // attendance
    attended: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // certificate
    certificateUrl: { type: String, default: '' },
    certificateCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, email: 1 }, { unique: true });
registrationSchema.index({ qrToken: 1 });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
