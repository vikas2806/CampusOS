const CertificateTemplate = require('../models/CertificateTemplate');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// GET /api/certificates/templates/:eventId
const getTemplate = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const template = await CertificateTemplate.findOne({ event: eventId })
    .populate('event', 'title startDate endDate venue')
    .populate('club', 'name logo');

  if (!template) {
    return res.json({ success: true, template: null });
  }

  res.json({ success: true, template });
});

// POST /api/certificates/templates
const upsertTemplate = asyncWrapper(async (req, res) => {
  const {
    eventId,
    title,
    subtitle,
    body,
    issuerName,
    issuerTitle,
    signatoryName,
    signatoryTitle,
    issueDate,
    style,
    logoUrl,
    signatureUrl,
  } = req.body;

  if (!eventId) {
    throw new AppError('eventId is required', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const template = await CertificateTemplate.findOneAndUpdate(
    { event: eventId },
    {
      event: eventId,
      club: event.club,
      title: title || 'Certificate of Participation',
      subtitle: subtitle || 'This is proudly presented to',
      body: body || 'for active participation and successful completion of the event.',
      issuerName: issuerName || '',
      issuerTitle: issuerTitle || 'Faculty Coordinator',
      signatoryName: signatoryName || '',
      signatoryTitle: signatoryTitle || 'Club Lead',
      issueDate: issueDate || new Date(),
      style: style || 'modern',
      logoUrl: logoUrl || '',
      signatureUrl: signatureUrl || '',
      createdBy: req.user._id,
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ success: true, template });
});

// GET /api/certificates/templates
const listTemplates = asyncWrapper(async (req, res) => {
  const { clubId } = req.query;
  const filter = clubId ? { club: clubId } : {};

  const templates = await CertificateTemplate.find(filter)
    .populate('event', 'title startDate endDate')
    .populate('club', 'name logo')
    .sort({ createdAt: -1 });

  res.json({ success: true, templates });
});

module.exports = {
  getTemplate,
  upsertTemplate,
  listTemplates,
};
