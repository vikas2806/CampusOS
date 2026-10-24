const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createClub,
  getMyClub,
  updateClub,
  addMember,
  removeMember,
  getBillingPlans,
  createUpgradeOrder,
  upgradeClubPlan,
} = require('../controllers/clubController');

const router = express.Router();

router.use(protect);

router.get('/plans', getBillingPlans);
router.post('/', createClub);
router.get('/mine', getMyClub);
router.patch('/:id', requireRole('admin', 'organiser'), updateClub);
router.post('/:id/members', requireRole('admin', 'organiser'), addMember);
router.delete('/:id/members/:userId', requireRole('admin', 'organiser'), removeMember);

// Billing & plan upgrade
router.post('/:id/create-order', requireRole('admin', 'organiser'), createUpgradeOrder);
router.post('/:id/upgrade', requireRole('admin', 'organiser'), upgradeClubPlan);

module.exports = router;
