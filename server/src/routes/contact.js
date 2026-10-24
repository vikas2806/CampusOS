const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  submitContact,
  listContacts,
  updateContactStatus,
} = require('../controllers/contactController');

const router = express.Router();

// Public submission route
router.post('/', submitContact);

// Admin-only management routes
router.use(protect);
router.use(requireRole('admin'));

router.get('/', listContacts);
router.patch('/:id', updateContactStatus);

module.exports = router;
