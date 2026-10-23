const express = require('express');
const protect = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getBudget, upsertBudget, addExpense, deleteExpense, addIncome } = require('../controllers/budgetController');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'organiser'));

router.get('/:eventId', getBudget);
router.post('/', upsertBudget);
router.post('/:eventId/expenses', addExpense);
router.delete('/:eventId/expenses/:expenseId', deleteExpense);
router.post('/:eventId/income', addIncome);

module.exports = router;
