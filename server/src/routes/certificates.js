const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getTemplate,
  upsertTemplate,
  listTemplates,
} = require('../controllers/certificateController');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'organiser'));

router.get('/templates', listTemplates);
router.get('/templates/:eventId', getTemplate);
router.post('/templates', upsertTemplate);

module.exports = router;
