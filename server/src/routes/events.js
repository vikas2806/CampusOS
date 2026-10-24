const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createEvent,
  updateEvent,
  listEvents,
  getEvent,
  deleteEvent,
} = require('../controllers/eventController');

const { checkEventLimit } = require('../middleware/planLimits');

const router = express.Router();

// public route (slug-based) handled in a separate route file
// authenticated routes
router.use(protect);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireRole('admin', 'organiser'), checkEventLimit, createEvent);
router.patch('/:id', requireRole('admin', 'organiser'), updateEvent);
router.delete('/:id', requireRole('admin', 'organiser'), deleteEvent);

module.exports = router;
