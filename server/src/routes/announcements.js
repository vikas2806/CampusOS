const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { sendAnnouncement, listAnnouncements } = require('../controllers/announcementController');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'organiser'));

router.post('/', sendAnnouncement);
router.get('/', listAnnouncements);

module.exports = router;
