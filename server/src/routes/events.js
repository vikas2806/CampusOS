const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
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
} = require('../controllers/eventController');

const { checkEventLimit } = require('../middleware/planLimits');

const router = express.Router();

router.use(protect);

// Template routes
router.get('/templates', listTemplates);
router.post('/templates', requireRole('admin', 'organiser'), createTemplate);
router.post(
  '/templates/:templateId/instantiate',
  requireRole('admin', 'organiser'),
  checkEventLimit,
  createFromTemplate
);
router.delete('/templates/:id', requireRole('admin', 'organiser'), deleteTemplate);

// Event routes
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', requireRole('admin', 'organiser'), checkEventLimit, createEvent);
router.post('/:id/template', requireRole('admin', 'organiser'), saveAsTemplate);
router.patch('/:id', requireRole('admin', 'organiser'), updateEvent);
router.delete('/:id', requireRole('admin', 'organiser'), deleteEvent);

module.exports = router;
