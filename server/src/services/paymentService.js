const crypto = require('crypto');

const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    interval: 'forever',
    description: 'For small clubs and student societies starting out',
    limits: { maxEvents: 3, maxAttendees: 100, teamSize: 3 },
    features: [
      'Up to 3 events',
      '100 participants per event',
      '3 team organisers',
      'QR code attendee check-in',
      'Basic event page',
    ],
  },
  event_pro: {
    id: 'event_pro',
    name: 'Event Pro',
    price: 999,
    interval: 'per fest / semester',
    description: 'Ideal for flagship fests, hackathons, and symposiums',
    limits: { maxEvents: 10, maxAttendees: 500, teamSize: 10 },
    features: [
      'Up to 10 events',
      '500 participants per event',
      '10 team organisers',
      'Custom branded PDF certificates with QR verification',
      'Full CSV export for attendee & budget data',
      'Volunteer task manager',
    ],
  },
  club: {
    id: 'club',
    name: 'Club Unlimited',
    price: 3499,
    interval: 'per year',
    description: 'Full campus operations suite for active student bodies',
    limits: { maxEvents: 50, maxAttendees: 2000, teamSize: 25 },
    features: [
      'Up to 50 events',
      '2,000 participants per event',
      '25 team organisers',
      'Bulk certificate generation & issuance',
      'Announcement blast via email',
      'Complete budget & revenue management',
      'Event cloning & templates',
      'Priority email support',
    ],
  },
  institution: {
    id: 'institution',
    name: 'Campus Enterprise',
    price: 14999,
    interval: 'per year',
    description: 'Campus-wide management for colleges & university departments',
    limits: { maxEvents: Infinity, maxAttendees: Infinity, teamSize: Infinity },
    features: [
      'Unlimited events & clubs',
      'Unlimited attendees & registrations',
      'Unlimited team organisers & volunteers',
      'Custom university logo & subdomains',
      'Central administrative audit & reporting',
      'Dedicated support & training',
    ],
  },
};

// Create a simulated or Razorpay order
async function createOrder({ clubId, planId }) {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan selected');
  }

  const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  return {
    orderId,
    planId,
    amount: plan.price,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_campusos',
  };
}

// Verify payment
function verifyPayment({ orderId, paymentId, signature }) {
  // If in test/dev mode without real gateway keys, accept simulated payment IDs
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

module.exports = {
  PLANS,
  createOrder,
  verifyPayment,
};
