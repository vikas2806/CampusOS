const Club = require('../models/Club');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const asyncWrapper = require('../utils/asyncWrapper');

const PLAN_LIMITS = {
  free: {
    maxEvents: 3,
    maxRegistrationsPerEvent: 100,
    maxMembers: 3,
    customCertificates: false,
    analytics: 'basic',
  },
  event_pro: {
    maxEvents: 10,
    maxRegistrationsPerEvent: 500,
    maxMembers: 10,
    customCertificates: true,
    analytics: 'advanced',
  },
  club: {
    maxEvents: 50,
    maxRegistrationsPerEvent: 2000,
    maxMembers: 25,
    customCertificates: true,
    analytics: 'advanced',
  },
  institution: {
    maxEvents: Infinity,
    maxRegistrationsPerEvent: Infinity,
    maxMembers: Infinity,
    customCertificates: true,
    analytics: 'enterprise',
  },
};

// Return the effective plan, defaulting to 'free' if subscription expired
function getEffectivePlan(club) {
  if (!club || !club.plan) return 'free';
  if (club.plan !== 'free' && club.planExpiresAt && new Date(club.planExpiresAt) < new Date()) {
    return 'free';
  }
  return club.plan;
}

// Middleware: Check event creation limit for the club
const checkEventLimit = asyncWrapper(async (req, res, next) => {
  const clubId = req.body.clubId || req.params.clubId || req.query.clubId;
  if (!clubId) {
    return next();
  }

  const club = await Club.findById(clubId);
  if (!club) {
    throw new AppError('Club not found', 404);
  }

  const plan = getEffectivePlan(club);
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const currentEventCount = await Event.countDocuments({ club: clubId, isTemplate: false });

  if (currentEventCount >= limits.maxEvents) {
    throw new AppError(
      `Event creation limit reached (${limits.maxEvents} events) for your ${plan} plan. Please upgrade your club subscription to create more events.`,
      403
    );
  }

  req.club = club;
  next();
});

// Middleware: Check registration limit for the event based on club plan
const checkRegistrationLimit = asyncWrapper(async (req, res, next) => {
  const eventSlug = req.body.eventSlug;
  const eventId = req.body.eventId || req.params.eventId;

  let event = null;
  if (eventSlug) {
    event = await Event.findOne({ slug: eventSlug }).populate('club');
  } else if (eventId) {
    event = await Event.findById(eventId).populate('club');
  }

  if (!event || !event.club) {
    return next();
  }

  const plan = getEffectivePlan(event.club);
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (event.registrationCount >= limits.maxRegistrationsPerEvent) {
    throw new AppError(
      `Registration capacity limit (${limits.maxRegistrationsPerEvent} participants) reached for this event under the club's ${plan} plan.`,
      400
    );
  }

  req.event = event;
  next();
});

// Middleware: Require specific plan(s)
const requirePlan = (...allowedPlans) => {
  return asyncWrapper(async (req, res, next) => {
    const clubId = req.params.clubId || req.body.clubId || req.query.clubId;
    if (!clubId) {
      return next();
    }

    const club = await Club.findById(clubId);
    if (!club) {
      throw new AppError('Club not found', 404);
    }

    const currentPlan = getEffectivePlan(club);
    if (!allowedPlans.includes(currentPlan)) {
      throw new AppError(
        `This feature is available exclusively on ${allowedPlans.join(' or ')} plans. Currently on: ${currentPlan}.`,
        403
      );
    }

    req.club = club;
    next();
  });
};

module.exports = {
  PLAN_LIMITS,
  getEffectivePlan,
  checkEventLimit,
  checkRegistrationLimit,
  requirePlan,
};
