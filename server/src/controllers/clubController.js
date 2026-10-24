const Club = require('../models/Club');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// POST /api/clubs
const createClub = asyncWrapper(async (req, res) => {
  const { name, description, institution, city, website } = req.body;
  if (!name) throw new AppError('Club name is required', 400);

  const club = await Club.create({
    name,
    description,
    institution,
    city,
    website,
    owner: req.user._id,
    members: [{ user: req.user._id, role: req.user.role === 'admin' ? 'admin' : 'organiser' }],
  });

  // attach club to the user
  await User.findByIdAndUpdate(req.user._id, { club: club._id });

  res.status(201).json({ success: true, club });
});

// GET /api/clubs/mine
const getMyClub = asyncWrapper(async (req, res) => {
  const club = await Club.findOne({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).populate('members.user', 'name email role avatar');

  if (!club) throw new AppError('No club found', 404);
  res.json({ success: true, club });
});

// PATCH /api/clubs/:id
const updateClub = asyncWrapper(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw new AppError('Club not found', 404);
  if (club.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only the club owner can update club info', 403);
  }
  const { name, description, institution, city, website, logo } = req.body;
  Object.assign(club, { name, description, institution, city, website, logo });
  await club.save();
  res.json({ success: true, club });
});

// POST /api/clubs/:id/members
const addMember = asyncWrapper(async (req, res) => {
  const { email, role } = req.body;
  const club = await Club.findById(req.params.id);
  if (!club) throw new AppError('Club not found', 404);
  if (club.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only owner can add members', 403);
  }

  const user = await User.findOne({ email });
  if (!user) throw new AppError('No user with that email', 404);

  const already = club.members.find((m) => m.user.toString() === user._id.toString());
  if (already) throw new AppError('User is already a member', 409);

  const memberRole = ['admin', 'organiser', 'volunteer'].includes(role) ? role : 'organiser';
  club.members.push({ user: user._id, role: memberRole });
  await club.save();
  await User.findByIdAndUpdate(user._id, { club: club._id });

  res.json({ success: true, message: 'Member added', club });
});

// DELETE /api/clubs/:id/members/:userId
const removeMember = asyncWrapper(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw new AppError('Club not found', 404);
  if (club.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Only owner can remove members', 403);
  }
  club.members = club.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  await club.save();
  res.json({ success: true, message: 'Member removed' });
});

// GET /api/clubs/plans
const getBillingPlans = asyncWrapper(async (req, res) => {
  const { PLANS } = require('../services/paymentService');
  res.json({ success: true, plans: PLANS });
});

// POST /api/clubs/:id/create-order
const createUpgradeOrder = asyncWrapper(async (req, res) => {
  const { plan } = req.body;
  const club = await Club.findById(req.params.id);
  if (!club) throw new AppError('Club not found', 404);

  const { createOrder } = require('../services/paymentService');
  const order = await createOrder({ clubId: club._id, planId: plan });
  res.json({ success: true, order });
});

// POST /api/clubs/:id/upgrade
const upgradeClubPlan = asyncWrapper(async (req, res) => {
  const { plan, orderId, paymentId, signature, durationDays = 365 } = req.body;
  const club = await Club.findById(req.params.id);
  if (!club) throw new AppError('Club not found', 404);

  const { PLANS, verifyPayment } = require('../services/paymentService');
  if (!PLANS[plan]) {
    throw new AppError('Invalid plan specified', 400);
  }

  // verify payment
  if (orderId && paymentId) {
    const isValid = verifyPayment({ orderId, paymentId, signature });
    if (!isValid) {
      throw new AppError('Payment signature verification failed', 400);
    }
  }

  club.plan = plan;
  club.planExpiresAt =
    plan === 'free' ? null : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await club.save();

  res.json({
    success: true,
    message: `Plan upgraded successfully to ${PLANS[plan].name}`,
    club,
  });
});

module.exports = {
  createClub,
  getMyClub,
  updateClub,
  addMember,
  removeMember,
  getBillingPlans,
  createUpgradeOrder,
  upgradeClubPlan,
};
