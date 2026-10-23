const Budget = require('../models/Budget');
const Event = require('../models/Event');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// GET /api/budget/:eventId
const getBudget = asyncWrapper(async (req, res) => {
  let budget = await Budget.findOne({ event: req.params.eventId });
  if (!budget) {
    // return an empty budget structure if none exists yet
    return res.json({ success: true, budget: null });
  }
  res.json({ success: true, budget });
});

// POST /api/budget — create or replace budget
const upsertBudget = asyncWrapper(async (req, res) => {
  const { eventId, totalBudget, expenses, income, notes } = req.body;
  if (!eventId) throw new AppError('eventId required', 400);

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const budget = await Budget.findOneAndUpdate(
    { event: eventId },
    {
      event: eventId,
      club: event.club,
      createdBy: req.user._id,
      totalBudget: totalBudget || 0,
      expenses: expenses || [],
      income: income || [],
      notes: notes || '',
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({ success: true, budget });
});

// POST /api/budget/:eventId/expenses — add single expense
const addExpense = asyncWrapper(async (req, res) => {
  let budget = await Budget.findOne({ event: req.params.eventId });

  if (!budget) {
    const event = await Event.findById(req.params.eventId);
    if (!event) throw new AppError('Event not found', 404);
    budget = await Budget.create({
      event: req.params.eventId,
      club: event.club,
      createdBy: req.user._id,
    });
  }

  budget.expenses.push(req.body);
  await budget.save();
  res.json({ success: true, budget });
});

// DELETE /api/budget/:eventId/expenses/:expenseId
const deleteExpense = asyncWrapper(async (req, res) => {
  const budget = await Budget.findOne({ event: req.params.eventId });
  if (!budget) throw new AppError('Budget not found', 404);
  budget.expenses = budget.expenses.filter(
    (e) => e._id.toString() !== req.params.expenseId
  );
  await budget.save();
  res.json({ success: true, budget });
});

// POST /api/budget/:eventId/income — add income entry
const addIncome = asyncWrapper(async (req, res) => {
  let budget = await Budget.findOne({ event: req.params.eventId });
  if (!budget) {
    const event = await Event.findById(req.params.eventId);
    if (!event) throw new AppError('Event not found', 404);
    budget = await Budget.create({ event: req.params.eventId, club: event.club, createdBy: req.user._id });
  }
  budget.income.push(req.body);
  await budget.save();
  res.json({ success: true, budget });
});

module.exports = { getBudget, upsertBudget, addExpense, deleteExpense, addIncome };
