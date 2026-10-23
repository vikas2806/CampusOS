const { body } = require('express-validator');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');
const { validationResult } = require('express-validator');

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// POST /api/auth/register
const register = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  // only allow safe roles on self-registration
  const allowedRoles = ['organiser', 'volunteer'];
  const userRole = allowedRoles.includes(role) ? role : 'organiser';

  const user = await User.create({ name, email, password, role: userRole });
  const token = signToken(user._id);

  res.status(201).json({ success: true, token, user });
});

// POST /api/auth/login
const login = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const token = signToken(user._id);
  res.json({ success: true, token, user });
});

// GET /api/auth/me
const getMe = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user.id).populate('club', 'name slug plan');
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
});

// PATCH /api/auth/profile
const updateProfile = asyncWrapper(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

// POST /api/auth/change-password
const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new AppError('Provide currentPassword and newPassword', 400);
  }
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

module.exports = { register, login, getMe, updateProfile, changePassword, signToken };
