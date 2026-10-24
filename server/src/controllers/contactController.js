const Contact = require('../models/Contact');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { sendMail } = require('../services/emailService');

// POST /api/contact — public submission for contact & demo requests
const submitContact = asyncWrapper(async (req, res) => {
  const { name, email, phone, institution, role, message, type = 'contact' } = req.body;

  if (!name || !email || !message) {
    throw new AppError('Name, email, and message are required', 400);
  }

  const contact = await Contact.create({
    name,
    email,
    phone: phone || '',
    institution: institution || '',
    role: role || 'Student Organiser',
    message,
    type,
  });

  // Send acknowledgement email in the background
  try {
    const isDemo = type === 'demo';
    const subject = isDemo
      ? 'CampusOS Demo Request Received!'
      : 'Thank you for reaching out to CampusOS';

    await sendMail({
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Hi ${name},</h2>
          <p>Thank you for reaching out to <strong>CampusOS</strong>.</p>
          <p>${
            isDemo
              ? 'Our college campus onboarding team has received your demo request and will connect with you within 24 hours to schedule a walkthrough.'
              : 'We have received your message and will get back to you as soon as possible.'
          }</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Your message:</strong></p>
            <p style="margin: 8px 0 0; color: #1e293b;">${message.replace(/\n/g, '<br/>')}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">Best regards,<br/>The CampusOS Team</p>
        </div>
      `,
      text: `Hi ${name},\n\nThank you for reaching out to CampusOS. We have received your inquiry regarding "${message}" and our team will get back to you shortly.\n\nBest,\nCampusOS Team`,
    });
  } catch (err) {
    console.error('Failed to send contact autoresponder:', err.message);
  }

  res.status(201).json({
    success: true,
    message:
      type === 'demo'
        ? 'Demo request submitted successfully. Our team will contact you shortly!'
        : 'Thank you for your message. We will respond promptly!',
    contact,
  });
});

// GET /api/contact — admin only
const listContacts = asyncWrapper(async (req, res) => {
  const { status, type } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: contacts.length, contacts });
});

// PATCH /api/contact/:id — admin only
const updateContactStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'closed'].includes(status)) {
    throw new AppError('Invalid status value', 400);
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contact) {
    throw new AppError('Contact request not found', 404);
  }

  res.json({ success: true, contact });
});

module.exports = {
  submitContact,
  listContacts,
  updateContactStatus,
};
