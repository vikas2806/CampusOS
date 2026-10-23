const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
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
    title: { type: String, required: true },
    message: { type: String, required: true },
    sentTo: { type: Number, default: 0 },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
