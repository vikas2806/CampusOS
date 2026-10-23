const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createClub,
  getMyClub,
  updateClub,
  addMember,
  removeMember,
} = require('../controllers/clubController');

const router = express.Router();

router.use(protect);

router.post('/', createClub);
router.get('/mine', getMyClub);
router.patch('/:id', requireRole('admin', 'organiser'), updateClub);
router.post('/:id/members', requireRole('admin', 'organiser'), addMember);
router.delete('/:id/members/:userId', requireRole('admin', 'organiser'), removeMember);

module.exports = router;
