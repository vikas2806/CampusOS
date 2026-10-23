const Announcement = require('../models/Announcement');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { sendMail } = require('../services/emailService');

// POST /api/announcements
const sendAnnouncement = asyncWrapper(async (req, res) => {
  const { eventId, title, message } = req.body;
  if (!eventId || !title || !message) {
    throw new AppError('eventId, title and message required', 400);
  }

  const event = await Event.findById(eventId).populate('club');
  if (!event) throw new AppError('Event not found', 404);

  // get all confirmed registrations for this event
  const registrations = await Registration.find({
    event: eventId,
    status: 'confirmed',
  }).select('email name');

  if (registrations.length === 0) {
    throw new AppError('No registered participants to notify', 400);
  }

  // send emails (or console.log if SMTP not configured)
  const emailPromises = registrations.map((reg) =>
    sendMail({
      to: reg.email,
      subject: `[${event.title}] ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#6366f1">${title}</h2>
          <p>Hi <strong>${reg.name}</strong>,</p>
          <div>${message.replace(/\n/g, '<br/>')}</div>
          <hr/>
          <p style="color:#888;font-size:12px">This message is from <strong>${event.title}</strong> via CampusOS.</p>
        </div>
      `,
      text: `${title}\n\n${message}`,
    }).catch((err) => console.error(`Failed to send to ${reg.email}:`, err.message))
  );

  await Promise.allSettled(emailPromises);

  const announcement = await Announcement.create({
    event: eventId,
    club: event.club._id,
    createdBy: req.user._id,
    title,
    message,
    sentTo: registrations.length,
    emailSent: true,
  });

  res.status(201).json({
    success: true,
    announcement,
    sent: registrations.length,
  });
});

// GET /api/announcements?eventId=
const listAnnouncements = asyncWrapper(async (req, res) => {
  const { eventId } = req.query;
  const filter = eventId ? { event: eventId } : {};
  const announcements = await Announcement.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');
  res.json({ success: true, announcements });
});

module.exports = { sendAnnouncement, listAnnouncements };
