const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { generateQrToken, generateQrDataUrl } = require('../services/qrService');
const { sendRegistrationConfirmation } = require('../services/emailService');

// POST /api/public/register — no auth required
const publicRegister = asyncWrapper(async (req, res) => {
  const { eventSlug, name, email, phone, answers } = req.body;

  if (!eventSlug || !name || !email) {
    throw new AppError('eventSlug, name and email are required', 400);
  }

  // find event
  const event = await Event.findOne({ slug: eventSlug, status: 'published' });
  if (!event) throw new AppError('Event not found or not accepting registrations', 404);

  // check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw new AppError('Registration deadline has passed', 400);
  }

  // duplicate check
  const duplicate = await Registration.findOne({ event: event._id, email: email.toLowerCase() });
  if (duplicate) throw new AppError('This email is already registered for this event', 409);

  // capacity check
  if (event.capacity > 0 && event.registrationCount >= event.capacity) {
    throw new AppError('This event is full', 400);
  }

  // create registration
  const registration = await Registration.create({
    event: event._id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    answers: answers || [],
    status: 'confirmed',
  });

  // generate QR token and image
  const qrToken = generateQrToken(registration._id, event._id);
  const qrDataUrl = await generateQrDataUrl(qrToken);

  registration.qrToken = qrToken;
  registration.qrCode = qrDataUrl;
  await registration.save();

  // increment count
  await Event.findByIdAndUpdate(event._id, { $inc: { registrationCount: 1 } });

  // send confirmation email (non-blocking)
  sendRegistrationConfirmation({
    to: email,
    name,
    eventTitle: event.title,
    qrDataUrl,
    eventDate: event.startDate,
    venue: event.venue,
  }).catch((err) => console.error('Email send error:', err.message));

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    registration: {
      id: registration._id,
      name: registration.name,
      email: registration.email,
      qrCode: qrDataUrl,
      eventTitle: event.title,
      eventDate: event.startDate,
      venue: event.venue,
    },
  });
});

// GET /api/registrations — list registrations (organiser)
const listRegistrations = asyncWrapper(async (req, res) => {
  const { eventId, search, attended, status, page = 1, limit = 50 } = req.query;

  if (!eventId) throw new AppError('eventId query param required', 400);

  // verify event belongs to user's club
  const event = await Event.findById(eventId).populate('club');
  if (!event) throw new AppError('Event not found', 404);

  const filter = { event: eventId };
  if (attended !== undefined) filter.attended = attended === 'true';
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-qrCode'), // don't send QR images in list
    Registration.countDocuments(filter),
  ]);

  res.json({ success: true, registrations, total, page: Number(page) });
});

// GET /api/registrations/:id
const getRegistration = asyncWrapper(async (req, res) => {
  const reg = await Registration.findById(req.params.id)
    .populate('event', 'title slug startDate venue')
    .populate('checkedInBy', 'name email');
  if (!reg) throw new AppError('Registration not found', 404);
  res.json({ success: true, registration: reg });
});

module.exports = { publicRegister, listRegistrations, getRegistration };
