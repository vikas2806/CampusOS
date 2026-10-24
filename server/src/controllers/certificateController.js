const CertificateTemplate = require('../models/CertificateTemplate');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const {
  generateCertificatePdf,
  generateCertificateCode,
} = require('../services/certificateService');

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

// GET /api/certificates/:registrationId/download
const downloadCertificate = asyncWrapper(async (req, res) => {
  const { registrationId } = req.params;

  const registration = await Registration.findById(registrationId).populate({
    path: 'event',
    populate: { path: 'club' },
  });

  if (!registration) {
    throw new AppError('Registration not found', 404);
  }

  const event = registration.event;
  const club = event ? event.club : null;

  // Retrieve template if configured
  const template = (await CertificateTemplate.findOne({ event: event._id })) || {};

  // If certificateCode not generated yet, assign one
  if (!registration.certificateCode) {
    registration.certificateCode = generateCertificateCode(registration._id);
    await registration.save();
  }

  const { pdfBuffer } = await generateCertificatePdf({
    template,
    registration,
    event,
    club,
  });

  const safeFilename = `${(registration.name || 'certificate').replace(/[^a-zA-Z0-9]/g, '_')}_certificate.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.send(pdfBuffer);
});

// POST /api/certificates/events/:eventId/issue
const issueCertificatesForEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const { onlyAttended = false } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const query = { event: eventId, status: 'confirmed' };
  if (onlyAttended) {
    query.attended = true;
  }

  const registrations = await Registration.find(query);
  let updatedCount = 0;

  for (const reg of registrations) {
    if (!reg.certificateCode) {
      reg.certificateCode = generateCertificateCode(reg._id);
      await reg.save();
      updatedCount++;
    }
  }

  res.json({
    success: true,
    message: `Certificates issued for ${registrations.length} participants (${updatedCount} new)`,
    total: registrations.length,
    newIssued: updatedCount,
  });
});

// GET /api/certificates/verify/:code
const verifyCertificate = asyncWrapper(async (req, res) => {
  const { code } = req.params;
  if (!code) {
    throw new AppError('Certificate verification code is required', 400);
  }

  const registration = await Registration.findOne({
    certificateCode: code.toUpperCase().trim(),
  }).populate({
    path: 'event',
    populate: { path: 'club', select: 'name logo institution city' },
    select: 'title startDate endDate venue description club',
  });

  if (!registration) {
    throw new AppError('Certificate not found or verification code is invalid', 404);
  }

  const event = registration.event;
  const club = event ? event.club : null;
  const template = await CertificateTemplate.findOne({ event: event ? event._id : null });

  res.json({
    success: true,
    verified: true,
    certificate: {
      code: registration.certificateCode,
      recipientName: registration.name,
      eventName: event ? event.title : 'Event',
      eventDate: event ? event.startDate : null,
      clubName: club ? club.name : 'Club',
      institution: club ? club.institution : '',
      title: template ? template.title : 'Certificate of Participation',
      issuerName: template ? template.issuerName : '',
      issuerTitle: template ? template.issuerTitle : '',
      signatoryName: template ? template.signatoryName : '',
      signatoryTitle: template ? template.signatoryTitle : '',
      issuedAt: template ? template.issueDate : registration.updatedAt,
      status: registration.status,
      attended: registration.attended,
    },
  });
});

// GET /api/certificates/verify/:code/pdf
const downloadVerifiedCertificate = asyncWrapper(async (req, res) => {
  const { code } = req.params;
  const registration = await Registration.findOne({
    certificateCode: code.toUpperCase().trim(),
  }).populate({
    path: 'event',
    populate: { path: 'club' },
  });

  if (!registration) {
    throw new AppError('Certificate not found or invalid code', 404);
  }

  const event = registration.event;
  const club = event ? event.club : null;
  const template = (await CertificateTemplate.findOne({ event: event._id })) || {};

  const { pdfBuffer } = await generateCertificatePdf({
    template,
    registration,
    event,
    club,
  });

  const safeFilename = `${(registration.name || 'certificate').replace(/[^a-zA-Z0-9]/g, '_')}_certificate.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
  res.send(pdfBuffer);
});

module.exports = {
  getTemplate,
  upsertTemplate,
  listTemplates,
  downloadCertificate,
  issueCertificatesForEvent,
  verifyCertificate,
  downloadVerifiedCertificate,
};
