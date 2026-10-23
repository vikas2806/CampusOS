const express = require('express');
const protect = require('../middleware/auth');
const { listRegistrations, getRegistration } = require('../controllers/registrationController');

const router = express.Router();

router.use(protect);
router.get('/', listRegistrations);
router.get('/:id', getRegistration);

module.exports = router;
