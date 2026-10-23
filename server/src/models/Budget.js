const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { type: String, default: 'Other' },
  description: { type: String, required: true },
  expected: { type: Number, default: 0 },
  actual: { type: Number, default: 0 },
  paidBy: { type: String, default: '' },
  receipt: { type: String, default: '' },
});

const incomeSchema = new mongoose.Schema({
  source: { type: String, required: true }, // sponsor name, ticket sales, etc.
  description: { type: String, default: '' },
  expected: { type: Number, default: 0 },
  actual: { type: Number, default: 0 },
});

const budgetSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalBudget: { type: Number, default: 0 },
    expenses: [expenseSchema],
    income: [incomeSchema],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// virtual totals
budgetSchema.virtual('totalExpected').get(function () {
  return this.expenses.reduce((s, e) => s + (e.expected || 0), 0);
});

budgetSchema.virtual('totalActual').get(function () {
  return this.expenses.reduce((s, e) => s + (e.actual || 0), 0);
});

budgetSchema.virtual('totalIncome').get(function () {
  return this.income.reduce((s, i) => s + (i.actual || 0), 0);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
