const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
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
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    institution: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      default: 'Student Organiser',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message or inquiry details required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['contact', 'demo', 'enterprise'],
      default: 'contact',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
