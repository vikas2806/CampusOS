const Event = require('../models/Event');
const Club = require('../models/Club');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// helper: verify user belongs to club
async function verifyClubAccess(clubId, userId) {
  const club = await Club.findById(clubId);
  if (!club) throw new AppError('Club not found', 404);
  const isMember = club.members.some((m) => m.user.toString() === userId.toString());
  const isOwner = club.owner.toString() === userId.toString();
  if (!isMember && !isOwner) throw new AppError('Not a member of this club', 403);
  return club;
}

// POST /api/events
const createEvent = asyncWrapper(async (req, res) => {
  const { clubId, title, description, startDate, endDate, venue, capacity,
          rules, schedule, customFields, registrationDeadline, banner, isPublic } = req.body;

  if (!clubId) throw new AppError('clubId is required', 400);
  const club = await verifyClubAccess(clubId, req.user._id);

  const event = await Event.create({
    club: clubId,
    createdBy: req.user._id,
    title,
    description,
    startDate,
    endDate,
    venue,
    capacity: capacity || 0,
    rules,
    schedule: schedule || [],
    customFields: customFields || [],
    registrationDeadline,
    banner,
    isPublic: isPublic !== false,
    plan: club.plan,
  });

  res.status(201).json({ success: true, event });
});

// PATCH /api/events/:id
const updateEvent = asyncWrapper(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);

  await verifyClubAccess(event.club, req.user._id);

  const allowed = ['title', 'description', 'startDate', 'endDate', 'venue',
    'capacity', 'rules', 'schedule', 'customFields', 'registrationDeadline',
    'banner', 'isPublic', 'status'];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  await event.save();
  res.json({ success: true, event });
});

// GET /api/events — list events for the user's club
const listEvents = asyncWrapper(async (req, res) => {
  const { clubId, status, page = 1, limit = 20 } = req.query;

  const filter = { isTemplate: false };
  if (clubId) filter.club = clubId;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email'),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, events, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/events/:id
const getEvent = asyncWrapper(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('club', 'name slug plan');
  if (!event) throw new AppError('Event not found', 404);
  res.json({ success: true, event });
});

// DELETE /api/events/:id
const deleteEvent = asyncWrapper(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  await verifyClubAccess(event.club, req.user._id);
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

// GET /api/events/templates
const listTemplates = asyncWrapper(async (req, res) => {
  const { clubId } = req.query;
  const filter = { isTemplate: true };
  if (clubId) {
    filter.$or = [{ club: clubId }, { club: null }];
  }
  const templates = await Event.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, templates });
});

// POST /api/events/templates
const createTemplate = asyncWrapper(async (req, res) => {
  const { clubId, templateName, title, description, venue, rules, schedule, customFields, banner } = req.body;
  if (!templateName) throw new AppError('templateName is required', 400);

  if (clubId) {
    await verifyClubAccess(clubId, req.user._id);
  }

  const template = await Event.create({
    club: clubId || null,
    createdBy: req.user._id,
    title: title || templateName,
    templateName,
    isTemplate: true,
    description: description || '',
    venue: venue || '',
    rules: rules || '',
    schedule: schedule || [],
    customFields: customFields || [],
    banner: banner || '',
    status: 'draft',
    startDate: new Date(),
    endDate: new Date(),
  });

  res.status(201).json({ success: true, template });
});

// POST /api/events/:id/template
const saveAsTemplate = asyncWrapper(async (req, res) => {
  const { templateName } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  await verifyClubAccess(event.club, req.user._id);

  const template = await Event.create({
    club: event.club,
    createdBy: req.user._id,
    title: event.title,
    templateName: templateName || `${event.title} Template`,
    isTemplate: true,
    description: event.description,
    venue: event.venue,
    capacity: event.capacity,
    rules: event.rules,
    schedule: event.schedule,
    customFields: event.customFields,
    banner: event.banner,
    status: 'draft',
    startDate: new Date(),
    endDate: new Date(),
  });

  res.status(201).json({ success: true, template });
});

// POST /api/events/templates/:templateId/instantiate
const createFromTemplate = asyncWrapper(async (req, res) => {
  const { templateId } = req.params;
  const { clubId, title, startDate, endDate, venue, capacity, registrationDeadline } = req.body;

  const template = await Event.findOne({ _id: templateId, isTemplate: true });
  if (!template) throw new AppError('Event template not found', 404);

  const targetClubId = clubId || template.club;
  if (!targetClubId) throw new AppError('clubId is required to instantiate template', 400);

  const club = await verifyClubAccess(targetClubId, req.user._id);

  const newEvent = await Event.create({
    club: targetClubId,
    createdBy: req.user._id,
    title: title || template.title,
    description: template.description,
    startDate: startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: endDate || new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    venue: venue || template.venue,
    capacity: capacity !== undefined ? capacity : template.capacity,
    registrationDeadline: registrationDeadline || null,
    rules: template.rules,
    schedule: template.schedule,
    customFields: template.customFields,
    banner: template.banner,
    isPublic: true,
    status: 'draft',
    isTemplate: false,
    plan: club.plan,
  });

  res.status(201).json({ success: true, event: newEvent });
});

// DELETE /api/events/templates/:id
const deleteTemplate = asyncWrapper(async (req, res) => {
  const template = await Event.findOne({ _id: req.params.id, isTemplate: true });
  if (!template) throw new AppError('Template not found', 404);
  if (template.club) {
    await verifyClubAccess(template.club, req.user._id);
  }
  await template.deleteOne();
  res.json({ success: true, message: 'Template deleted' });
});

module.exports = {
  createEvent,
  updateEvent,
  listEvents,
  getEvent,
  deleteEvent,
  listTemplates,
  createTemplate,
  saveAsTemplate,
  createFromTemplate,
  deleteTemplate,
};
