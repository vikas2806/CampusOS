const { stringify } = require('csv-stringify/sync');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Budget = require('../models/Budget');
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/AppError');

// GET /api/reports/events/:eventId/registrations/csv
// or GET /api/registrations/export/csv?eventId=...
const exportRegistrationsCsv = asyncWrapper(async (req, res) => {
  const eventId = req.params.eventId || req.query.eventId;
  if (!eventId) {
    throw new AppError('eventId is required for CSV export', 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const filter = { event: eventId };
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.attended === 'true') {
    filter.attended = true;
  }

  const registrations = await Registration.find(filter).sort({ createdAt: -1 });

  // Map each registration into a row
  const rows = registrations.map((r, idx) => {
    const row = {
      'S.No': idx + 1,
      Name: r.name,
      Email: r.email,
      Phone: r.phone || '',
      Status: r.status,
      Attended: r.attended ? 'Yes' : 'No',
      'Checked In At': r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : '',
      'Certificate Code': r.certificateCode || '',
      'Registered At': new Date(r.createdAt).toLocaleString(),
    };

    // If custom answers exist
    if (r.answers && r.answers.length > 0) {
      r.answers.forEach((ans) => {
        if (ans.label) {
          row[ans.label] = ans.value || '';
        }
      });
    }

    return row;
  });

  const csvContent = stringify(rows, { header: true });
  const filename = `${event.slug || 'event'}-registrations-${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// GET /api/reports/events/:eventId/budget/csv
const exportBudgetCsv = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const budget = await Budget.findOne({ event: eventId });
  if (!budget) {
    throw new AppError('No budget records found for this event', 404);
  }

  const rows = [];

  // Expenses
  (budget.expenses || []).forEach((e, idx) => {
    rows.push({
      Type: 'Expense',
      Item: idx + 1,
      Category: e.category || 'General',
      Description: e.description,
      'Expected Amount': e.expected || 0,
      'Actual Amount': e.actual || 0,
      'Paid By': e.paidBy || '',
    });
  });

  // Income
  (budget.income || []).forEach((i, idx) => {
    rows.push({
      Type: 'Income',
      Item: idx + 1,
      Category: 'Revenue / Sponsor',
      Description: i.source + (i.description ? ` (${i.description})` : ''),
      'Expected Amount': i.expected || 0,
      'Actual Amount': i.actual || 0,
      'Paid By': '',
    });
  });

  const csvContent = stringify(rows, { header: true });
  const filename = `${event.slug || 'event'}-budget-${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// GET /api/reports/events/:eventId
const getEventReport = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).populate('club', 'name');
  if (!event) throw new AppError('Event not found', 404);

  const [
    totalRegistrations,
    attendedCount,
    waitlistedCount,
    cancelledCount,
    budget,
    tasks,
    announcementsCount,
  ] = await Promise.all([
    Registration.countDocuments({ event: eventId, status: 'confirmed' }),
    Registration.countDocuments({ event: eventId, attended: true }),
    Registration.countDocuments({ event: eventId, status: 'waitlisted' }),
    Registration.countDocuments({ event: eventId, status: 'cancelled' }),
    Budget.findOne({ event: eventId }),
    Task.find({ event: eventId }),
    Announcement.countDocuments({ event: eventId }),
  ]);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const attendanceRate =
    totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

  const budgetSummary = budget
    ? {
        allocated: budget.totalBudget || 0,
        expectedExpense: budget.expenses.reduce((sum, e) => sum + (e.expected || 0), 0),
        actualExpense: budget.expenses.reduce((sum, e) => sum + (e.actual || 0), 0),
        totalIncome: budget.income.reduce((sum, i) => sum + (i.actual || 0), 0),
      }
    : null;

  res.json({
    success: true,
    report: {
      event: {
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity,
        club: event.club,
      },
      registrations: {
        confirmed: totalRegistrations,
        attended: attendedCount,
        waitlisted: waitlistedCount,
        cancelled: cancelledCount,
        attendanceRate: `${attendanceRate}%`,
        capacityFilled: event.capacity
          ? `${Math.round((totalRegistrations / event.capacity) * 100)}%`
          : 'N/A',
      },
      budget: budgetSummary,
      tasks: taskStats,
      announcementsCount,
    },
  });
});

// GET /api/reports/clubs/:clubId
const getClubReport = asyncWrapper(async (req, res) => {
  const { clubId } = req.params;

  const events = await Event.find({ club: clubId });
  const eventIds = events.map((e) => e._id);

  const [totalRegistrations, totalAttended, budgets] = await Promise.all([
    Registration.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
    Registration.countDocuments({ event: { $in: eventIds }, attended: true }),
    Budget.find({ event: { $in: eventIds } }),
  ]);

  const totalSpent = budgets.reduce((total, b) => {
    return total + (b.expenses || []).reduce((sub, e) => sub + (e.actual || 0), 0);
  }, 0);

  res.json({
    success: true,
    report: {
      clubId,
      totalEvents: events.length,
      upcomingEvents: events.filter((e) => new Date(e.startDate) > new Date()).length,
      completedEvents: events.filter((e) => new Date(e.endDate) < new Date()).length,
      totalRegistrations,
      totalAttended,
      overallAttendanceRate:
        totalRegistrations > 0
          ? `${Math.round((totalAttended / totalRegistrations) * 100)}%`
          : '0%',
      totalBudgetSpent: totalSpent,
    },
  });
});

module.exports = {
  exportRegistrationsCsv,
  exportBudgetCsv,
  getEventReport,
  getClubReport,
};
