const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Club = require('../models/Club');
const Budget = require('../models/Budget');
const Task = require('../models/Task');
const asyncWrapper = require('../utils/asyncWrapper');
const { PLAN_LIMITS, getEffectivePlan } = require('../middleware/planLimits');

// GET /api/dashboard/stats
const getDashboardStats = asyncWrapper(async (req, res) => {
  const { clubId } = req.query;
  let club = null;

  if (clubId) {
    club = await Club.findById(clubId);
  } else {
    club = await Club.findOne({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });
  }

  if (!club) {
    return res.json({
      success: true,
      hasClub: false,
      metrics: {
        totalEvents: 0,
        upcomingCount: 0,
        totalRegistrations: 0,
        totalAttended: 0,
        attendanceRate: '0%',
        totalBudgetAllocated: 0,
        totalBudgetSpent: 0,
        pendingTasks: 0,
        completedTasks: 0,
      },
      upcomingEvents: [],
      recentRegistrations: [],
      chartData: [],
    });
  }

  const effectivePlan = getEffectivePlan(club);
  const planLimits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;

  // Find all non-template events of the club
  const events = await Event.find({ club: club._id, isTemplate: false }).sort({ startDate: 1 });
  const eventIds = events.map((e) => e._id);

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= now);
  const completedEvents = events.filter((e) => new Date(e.endDate) < now);
  const ongoingEvents = events.filter(
    (e) => new Date(e.startDate) <= now && new Date(e.endDate) >= now
  );

  const [totalRegistrations, totalAttended, recentRegistrations, budgets, tasks] =
    await Promise.all([
      Registration.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
      Registration.countDocuments({ event: { $in: eventIds }, attended: true }),
      Registration.find({ event: { $in: eventIds } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('event', 'title startDate'),
      Budget.find({ event: { $in: eventIds } }),
      Task.find({ event: { $in: eventIds } }),
    ]);

  const totalBudgetAllocated = budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => {
    return sum + (b.expenses || []).reduce((sub, exp) => sub + (exp.actual || 0), 0);
  }, 0);

  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;

  const attendanceRate =
    totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

  // Chart series (latest 8 events)
  const chartData = events.slice(-8).map((e) => ({
    name: e.title.length > 15 ? `${e.title.substring(0, 15)}...` : e.title,
    registrations: e.registrationCount || 0,
    attendance: e.attendanceCount || 0,
    capacity: e.capacity || 0,
  }));

  res.json({
    success: true,
    hasClub: true,
    club: {
      id: club._id,
      name: club.name,
      slug: club.slug,
      plan: effectivePlan,
      planExpiresAt: club.planExpiresAt,
      limits: planLimits,
      membersCount: club.members.length,
    },
    metrics: {
      totalEvents: events.length,
      upcomingCount: upcomingEvents.length,
      ongoingCount: ongoingEvents.length,
      completedCount: completedEvents.length,
      totalRegistrations,
      totalAttended,
      attendanceRate: `${attendanceRate}%`,
      totalBudgetAllocated,
      totalBudgetSpent,
      pendingTasks,
      completedTasks,
    },
    upcomingEvents: upcomingEvents.slice(0, 5).map((e) => ({
      id: e._id,
      title: e.title,
      slug: e.slug,
      startDate: e.startDate,
      endDate: e.endDate,
      venue: e.venue,
      registrationCount: e.registrationCount,
      capacity: e.capacity,
      status: e.status,
    })),
    recentRegistrations: recentRegistrations.map((r) => ({
      id: r._id,
      name: r.name,
      email: r.email,
      eventTitle: r.event ? r.event.title : 'Event',
      status: r.status,
      attended: r.attended,
      createdAt: r.createdAt,
    })),
    chartData,
  });
});

module.exports = {
  getDashboardStats,
};
