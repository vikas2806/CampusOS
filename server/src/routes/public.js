const express = require('express');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { publicRegister } = require('../controllers/registrationController');

const router = express.Router();

// POST /api/public/register
router.post('/register', publicRegister);

// GET /api/public/events/:slug — no auth required
router.get('/events/:slug', asyncWrapper(async (req, res) => {
  const event = await Event.findOne({
    slug: req.params.slug,
    status: 'published',
    isPublic: true,
  })
    .populate('club', 'name slug logo institution city')
    .select('-__v');

  if (!event) throw new AppError('Event not found', 404);

  res.json({ success: true, event });
}));

// GET /api/public/events — list published events (for marketing/discover)
router.get('/events', asyncWrapper(async (req, res) => {
  const { clubSlug, page = 1, limit = 12 } = req.query;
  const filter = { status: 'published', isPublic: true, isTemplate: false };

  if (clubSlug) {
    const Club = require('../models/Club');
    const club = await Club.findOne({ slug: clubSlug });
    if (club) filter.club = club._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('club', 'name slug logo')
      .select('title slug description banner startDate venue registrationCount capacity'),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, events, total });
}));

module.exports = router;
