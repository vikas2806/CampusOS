import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Share2,
  Download,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  Check,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { publicService } from '../services/api';

export default function PublicEvent() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    answers: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await publicService.getEventBySlug(slug);
        if (res.data?.success && res.data.event) {
          setEvent(res.data.event);
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        setError(err.response?.data?.message || 'Event not found or has been made private.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (label, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [label]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Please provide your name and email address.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      // Format custom answers array
      const answersArray = Object.entries(formData.answers).map(([label, value]) => ({
        label,
        value,
      }));

      const payload = {
        eventSlug: slug,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        answers: answersArray,
      };

      const res = await publicService.register(payload);
      if (res.data?.success && res.data.registration) {
        setTicket(res.data.registration);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setFormError(
        err.response?.data?.message || 'Registration failed. You may already be registered or event is full.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-900 border border-slate-800" />
        <div className="h-80 rounded-3xl bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-rose-500/20 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Event Unavailable</h2>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Campus Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const capacity = event.capacity || 100;
  const registered = event.registrationCount || 0;
  const isFull = capacity > 0 && registered >= capacity;
  const isExpired = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);

  return (
    <div className="relative overflow-hidden pt-8 pb-24 lg:pt-14 lg:pb-32">
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Back Link */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Campus Events</span>
        </Link>

        {/* Hero Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {event.club?.name || 'College Tech Club'}
                </span>
                {event.club?.institution && (
                  <span className="text-xs text-slate-400">{event.club.institution}</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {event.description || 'Welcome to this college event. Register below for your spot pass.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Event Date</p>
                    <p className="text-slate-400">
                      {new Date(event.startDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Campus Venue</p>
                    <p className="text-slate-400">{event.venue || 'College Auditorium'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Capacity Pill */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shrink-0 w-full md:w-56 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Admission Status
              </span>
              <div className="text-2xl font-black text-white">
                {isFull ? (
                  <span className="text-rose-400">Sold Out</span>
                ) : (
                  <span className="text-emerald-400">Open Access</span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {capacity > 0 ? `${registered} / ${capacity} seats taken` : 'Unlimited seats'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Ticket View or Registration Form */}
        {ticket ? (
          /* Confirmation Ticket Card */
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border-2 border-indigo-500/50 shadow-2xl text-center max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Registration Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                You're In, {ticket.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Present this official gate pass or your confirmation email at the campus entry gate for sub-second scanner admission.
              </p>
            </div>

            {/* Pass Mockup */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Official Student Gate Pass
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{ticket.eventTitle}</h3>
                  <p className="text-xs text-slate-400">{ticket.venue}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  CONFIRMED
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Attendee</p>
                  <p className="text-sm font-bold text-white">{ticket.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{ticket.email}</p>
                </div>

                {/* QR Code */}
                {ticket.qrCode && (
                  <div className="p-2 bg-white rounded-xl shadow-md flex flex-col items-center">
                    <img src={ticket.qrCode} alt="Ticket QR Token" className="w-28 h-28" />
                    <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                      CampusOS Gate Token
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Pass</span>
              </button>
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <span>Browse More Events</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form Grid (2 Columns) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Attendee Registration</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Claim your free admission pass. Instant QR entry code delivered to your email.
                </p>
              </div>

              {formError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {isFull ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Event Capacity Full</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All seats for this event have been claimed. Check back later or explore other live campus events.
                  </p>
                </div>
              ) : isExpired ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Registration Closed</h3>
                  <p className="text-xs text-slate-400">The registration deadline for this event has passed.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Ananya Sharma"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="ananya@college.edu.in"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Dynamic Custom Questions */}
                  {event.customFields?.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {field.label} {field.required && <span className="text-indigo-400">*</span>}
                      </label>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                        value={formData.answers[field.label] || ''}
                        onChange={(e) => handleAnswerChange(field.label, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition-all mt-4"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating your QR pass...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Confirm Free Registration & Get Pass</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Schedule & Rules Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Timeline */}
              {event.schedule?.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Event Schedule</span>
                  </h3>
                  <div className="space-y-3">
                    {event.schedule.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-0.5">
                        <span className="font-mono text-indigo-400 font-bold">{s.time}</span>
                        <p className="font-semibold text-white">{s.title}</p>
                        {s.description && <p className="text-slate-400 text-[11px]">{s.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Guidelines */}
              {event.rules && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guidelines & Instructions</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.rules}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
