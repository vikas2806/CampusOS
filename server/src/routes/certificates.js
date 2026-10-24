const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getTemplate,
  upsertTemplate,
  listTemplates,
  downloadCertificate,
  issueCertificatesForEvent,
} = require('../controllers/certificateController');

const router = express.Router();

router.use(protect);

// Download certificate (accessible to authenticated users)
router.get('/:registrationId/download', downloadCertificate);

// Organiser / Admin routes
router.use(requireRole('admin', 'organiser'));

router.get('/templates', listTemplates);
router.get('/templates/:eventId', getTemplate);
router.post('/templates', upsertTemplate);
router.post('/events/:eventId/issue', issueCertificatesForEvent);

module.exports = router;
