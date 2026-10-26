import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  Building2,
  Calendar,
  Users,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  Receipt,
  HelpCircle,
  X,
  Crown
} from 'lucide-react';
import { clubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Checkout modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const fetchClubAndPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [clubRes, plansRes] = await Promise.all([
        clubService.getMyClub().catch((err) => {
          console.warn('Could not load club details:', err);
          return { data: { club: null } };
        }),
        clubService.getPlans().catch((err) => {
          console.warn('Could not load plans from backend:', err);
          return { data: { plans: null } };
        }),
      ]);

      if (clubRes.data?.club) {
        setClub(clubRes.data.club);
      } else if (user?.club) {
        setClub(typeof user.club === 'object' ? user.club : { _id: user.club, name: 'My Campus Club', plan: 'free' });
      }

      if (plansRes.data?.plans) {
        setPlans(plansRes.data.plans);
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
      setError(err.response?.data?.message || 'Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubAndPlans();
  }, []);

  const fallbackPlans = {
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
        'Basic event landing page',
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
        'Volunteer task coordination',
      ],
    },
    club: {
      id: 'club',
      name: 'Club Unlimited',
      price: 3499,
      interval: 'per year',
      description: 'Full campus operations suite for active student bodies',
      popular: true,
      limits: { maxEvents: 50, maxAttendees: 2000, teamSize: 25 },
      features: [
        'Up to 50 events',
        '2,000 participants per event',
        '25 team organisers',
        'Bulk certificate generation & issuance',
        'Announcement blast via email',
        'Complete budget & revenue management',
        'Event cloning & blueprint templates',
        'Priority email support',
      ],
    },
    institution: {
      id: 'institution',
      name: 'Campus Enterprise',
      price: 14999,
      interval: 'per year',
      description: 'Campus-wide management for colleges & university departments',
      limits: { maxEvents: 'Unlimited', maxAttendees: 'Unlimited', teamSize: 'Unlimited' },
      features: [
        'Unlimited events & multi-club governance',
        'Unlimited attendees & registrations',
        'Unlimited team organisers & volunteers',
        'Custom university logo & subdomains',
        'Central administrative audit & reporting',
        'Dedicated campus account manager',
      ],
    },
  };

  const activePlans = plans || fallbackPlans;
  const currentPlanKey = club?.plan || 'free';
  const currentPlanMeta = activePlans[currentPlanKey] || fallbackPlans.free;

  const handleOpenCheckout = async (planKey) => {
    if (planKey === currentPlanKey) return;
    const plan = activePlans[planKey];
    setSelectedPlan(plan);
    setError('');

    try {
      if (club?._id) {
        const res = await clubService.createOrder(club._id, { plan: planKey });
        if (res.data?.success) {
          setOrderData(res.data.order);
        }
      }
    } catch (err) {
      console.warn('Could not pre-create order on backend, using simulated checkout:', err);
      setOrderData({
        orderId: `order_sim_${Date.now()}`,
        planId: planKey,
        amount: plan.price,
        currency: 'INR',
      });
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      setIsProcessing(true);
      setError('');
      setSuccessMsg('');

      const clubId = club?._id;
      if (!clubId) {
        throw new Error('No active club associated with this account. Please register a club first.');
      }

      // Upgrade call to backend
      const payload = {
        plan: selectedPlan.id,
        orderId: orderData?.orderId || `order_${Date.now()}`,
        paymentId: `pay_sim_${Date.now()}`,
        signature: 'simulated_valid_signature',
        durationDays: selectedPlan.id === 'event_pro' ? 180 : 365,
      };

      const res = await clubService.upgradePlan(clubId, payload);
      if (res.data?.success) {
        setSuccessMsg(`Club plan upgraded to ${selectedPlan.name} successfully!`);
        setSelectedPlan(null);
        setOrderData(null);
        await fetchClubAndPlans();
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete plan upgrade.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1 tracking-wider uppercase">
            <CreditCard className="w-4 h-4" />
            <span>Subscriptions & Limits</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Billing & Club Tier
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {currentPlanMeta.name} Active
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Upgrade your club capacity for multi-track fests, custom verified certificates, volunteer operations, and unlimited participant seats.
          </p>
        </div>

        {club?.planExpiresAt && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400">
            <span className="text-slate-500 block mb-0.5">Subscription Renewal</span>
            <span className="font-semibold text-indigo-300">
              {new Date(club.planExpiresAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Club Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90 border border-indigo-500/20 backdrop-blur-sm">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Organizing Body</span>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            {club?.name || 'Campus Student Organization'}
          </h4>
          <p className="text-xs text-slate-500">{club?.college || 'University Campus'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Quota: Events</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{currentPlanMeta.limits?.maxEvents === Infinity || currentPlanMeta.limits?.maxEvents === 'Unlimited' ? 'Unlimited' : `${currentPlanMeta.limits?.maxEvents || 3} Events`}</span>
          </div>
          <p className="text-xs text-slate-500">Allowed published / active events</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Attendee Capacity</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span>{currentPlanMeta.limits?.maxAttendees === Infinity || currentPlanMeta.limits?.maxAttendees === 'Unlimited' ? 'Unlimited' : `${currentPlanMeta.limits?.maxAttendees || 100} / event`}</span>
          </div>
          <p className="text-xs text-slate-500">Simultaneous registered seats</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Team Seats</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>{currentPlanMeta.limits?.teamSize === Infinity || currentPlanMeta.limits?.teamSize === 'Unlimited' ? 'Unlimited' : `${currentPlanMeta.limits?.teamSize || 3} Organisers`}</span>
          </div>
          <p className="text-xs text-slate-500">Collaborators with admin access</p>
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Choose the Right Scale for Your Campus</h2>
          <p className="text-sm text-slate-400 mt-1">
            Transparent pricing with zero hidden convenience fees. Upgrades apply instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.entries(activePlans).map(([key, plan]) => {
            const isCurrent = currentPlanKey === key;
            const isPopular = plan.popular || key === 'club';

            return (
              <div
                key={key}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                    : isCurrent
                    ? 'bg-slate-900/80 border-2 border-emerald-500/50'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Popular or Current Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Most Popular
                  </div>
                )}
                {isCurrent && !isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                    Current Active Tier
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {key === 'institution' && <Building2 className="w-5 h-5 text-indigo-400" />}
                    {key === 'club' && <Crown className="w-5 h-5 text-amber-400" />}
                    {key === 'event_pro' && <Zap className="w-5 h-5 text-emerald-400" />}
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="my-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-400">/{plan.interval}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-slate-800/80">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold cursor-default text-center flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Current Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(key)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
                          : 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-indigo-600/10'
                      }`}
                    >
                      <span>{plan.price === 0 ? 'Downgrade to Starter' : `Upgrade to ${plan.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Perks & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Receipt className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">GST Invoices for Reimbursement</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All upgrade receipts come with standardized institutional tax bills formatted for student council and faculty advisor sign-offs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Instant Tier Activation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Limits are lifted immediately upon confirmation. No manual waiting periods or admin approval bottlenecks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">University Security & Compliance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Participant emails and student phone numbers are encrypted with strict role-based access for organizers only.
          </p>
        </div>
      </div>

      {/* Checkout & Upgrade Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">Confirm Upgrade</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setOrderData(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Selected Tier</span>
                  <span className="font-bold text-indigo-300 text-sm">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Subscription Validity</span>
                  <span className="text-slate-200">{selectedPlan.id === 'event_pro' ? '6 Months (Semester)' : selectedPlan.id === 'free' ? 'Lifetime' : '12 Months (Annual)'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/60">
                  <span>Total Amount</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {selectedPlan.price === 0 ? '₹0 (Free)' : `₹${selectedPlan.price.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
                <span>
                  Simulated Gateway: Clicking confirm will immediately activate the {selectedPlan.name} features and update club limits.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setOrderData(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmUpgrade}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                {isProcessing ? (
                  <span>Activating Plan...</span>
                ) : (
                  <>
                    <span>Confirm & Activate Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
