const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { scanCheckin, manualCheckin, liveAttendance } = require('../controllers/checkinController');

const router = express.Router();

router.use(protect);

router.post('/scan', requireRole('admin', 'organiser', 'volunteer'), scanCheckin);
router.post('/manual', requireRole('admin', 'organiser', 'volunteer'), manualCheckin);
router.get('/live/:eventId', liveAttendance);

module.exports = router;
