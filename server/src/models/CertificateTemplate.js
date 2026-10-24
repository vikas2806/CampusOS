const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    title: {
      type: String,
      default: 'Certificate of Participation',
      trim: true,
    },
    subtitle: {
      type: String,
      default: 'This is proudly presented to',
      trim: true,
    },
    body: {
      type: String,
      default: 'for active participation and successful completion of the event.',
      trim: true,
    },
    issuerName: {
      type: String,
      default: '',
      trim: true,
    },
    issuerTitle: {
      type: String,
      default: 'Faculty Coordinator',
      trim: true,
    },
    signatoryName: {
      type: String,
      default: '',
      trim: true,
    },
    signatoryTitle: {
      type: String,
      default: 'Club Lead',
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    style: {
      type: String,
      enum: ['modern', 'classic', 'minimal', 'gold'],
      default: 'modern',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    signatureUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

certificateTemplateSchema.index({ club: 1 });

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);
module.exports = CertificateTemplate;
