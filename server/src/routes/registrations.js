const express = require('express');
const protect = require('../middleware/auth');
const { listRegistrations, getRegistration } = require('../controllers/registrationController');
const { exportRegistrationsCsv } = require('../controllers/reportController');

const router = express.Router();

router.use(protect);
router.get('/export/csv', exportRegistrationsCsv);
router.get('/', listRegistrations);
router.get('/:id', getRegistration);

module.exports = router;
