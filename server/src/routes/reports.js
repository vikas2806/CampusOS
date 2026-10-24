const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  exportRegistrationsCsv,
  exportBudgetCsv,
  getEventReport,
  getClubReport,
} = require('../controllers/reportController');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'organiser'));

router.get('/events/:eventId/registrations/csv', exportRegistrationsCsv);
router.get('/events/:eventId/budget/csv', exportBudgetCsv);
router.get('/events/:eventId', getEventReport);
router.get('/clubs/:clubId', getClubReport);

module.exports = router;
