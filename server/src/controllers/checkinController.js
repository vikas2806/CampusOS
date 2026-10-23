const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { verifyQrToken } = require('../services/qrService');

// POST /api/checkin/scan — scan QR token (volunteer/organiser)
const scanCheckin = asyncWrapper(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError('QR token required', 400);

  let decoded;
  try {
    decoded = verifyQrToken(token);
  } catch {
    throw new AppError('Invalid or expired QR code', 400);
  }

  const registration = await Registration.findById(decoded.registrationId)
    .populate('event', 'title startDate venue');

  if (!registration) throw new AppError('Registration not found', 404);

  if (registration.attended) {
    return res.json({
      success: false,
      alreadyCheckedIn: true,
      message: 'Already checked in',
      registration: {
        name: registration.name,
        email: registration.email,
        checkedInAt: registration.checkedInAt,
      },
    });
  }

  registration.attended = true;
  registration.checkedInAt = new Date();
  registration.checkedInBy = req.user._id;
  await registration.save();

  // update event attendance count
  await Event.findByIdAndUpdate(decoded.eventId, { $inc: { attendanceCount: 1 } });

  res.json({
    success: true,
    message: 'Checked in successfully',
    registration: {
      name: registration.name,
      email: registration.email,
      event: registration.event,
      checkedInAt: registration.checkedInAt,
    },
  });
});

// POST /api/checkin/manual — manual check-in by registration id
const manualCheckin = asyncWrapper(async (req, res) => {
  const { registrationId } = req.body;
  if (!registrationId) throw new AppError('registrationId required', 400);

  const registration = await Registration.findById(registrationId)
    .populate('event', 'title');

  if (!registration) throw new AppError('Registration not found', 404);

  if (registration.attended) {
    return res.json({ success: false, alreadyCheckedIn: true, message: 'Already checked in' });
  }

  registration.attended = true;
  registration.checkedInAt = new Date();
  registration.checkedInBy = req.user._id;
  await registration.save();

  await Event.findByIdAndUpdate(registration.event._id, { $inc: { attendanceCount: 1 } });

  res.json({ success: true, message: 'Manually checked in', registration });
});

// GET /api/checkin/live/:eventId — live attendance count
const liveAttendance = asyncWrapper(async (req, res) => {
  const event = await Event.findById(req.params.eventId).select('title attendanceCount registrationCount');
  if (!event) throw new AppError('Event not found', 404);

  const checkedIn = await Registration.countDocuments({
    event: req.params.eventId,
    attended: true,
  });

  res.json({
    success: true,
    eventTitle: event.title,
    total: event.registrationCount,
    attended: checkedIn,
    remaining: event.registrationCount - checkedIn,
  });
});

module.exports = { scanCheckin, manualCheckin, liveAttendance };
