import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { contactService } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    role: 'Student Club Lead',
    message: '',
    type: 'demo', // 'demo' or 'contact'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await contactService.submit(formData);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit inquiry. Please try again or email us directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden pt-10 pb-24 lg:pt-16 lg:pb-32">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-48 w-80 h-80 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Connect with CampusOS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Let's Bring Chaos-Free Events to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
              Your Campus
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Schedule a personalized walkthrough for your club council, get onboarding assistance, or inquire about university-wide campus licenses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start">
          {/* Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            {/* Type selector tabs */}
            <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold mb-8">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: 'demo' }))}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'demo'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Campus Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: 'contact' }))}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'contact'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>General Inquiry</span>
              </button>
            </div>

            {success ? (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Received!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Thank you for reaching out, <span className="text-white font-semibold">{formData.name}</span>. Our college campus partnership team will connect with you at{' '}
                  <span className="text-indigo-400 font-mono text-xs">{formData.email}</span> within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        institution: '',
                        role: 'Student Club Lead',
                        message: '',
                        type: 'demo',
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                  <Link
                    to="/events"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Explore Campus Events
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Full Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Aryan Deshmukh"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      College / Official Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="aryan@college.ac.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      College / University Name
                    </label>
                    <input
                      type="text"
                      name="institution"
                      placeholder="e.g. IIT Delhi, VIT, NIT Trichy"
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Your Role on Campus
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Student Club Lead">Student Club Lead / President</option>
                    <option value="Event Coordinator">Fest Coordinator / Organiser</option>
                    <option value="Faculty Advisor">Faculty Advisor / Club Mentor</option>
                    <option value="Dean of Student Affairs">Dean / Student Affairs Officer</option>
                    <option value="Event Attendee">Student / Event Attendee</option>
                    <option value="Other">Other Community Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Message / What can we help with? <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about your upcoming event, expected attendee count, or features you are looking for..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{formData.type === 'demo' ? 'Submit Demo Request' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Direct Contact Channels</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email Us</p>
                    <a href="mailto:support@campusos.in" className="text-slate-400 hover:text-indigo-400 transition-colors">
                      support@campusos.in
                    </a>
                    <br />
                    <a href="mailto:partners@campusos.in" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">
                      partners@campusos.in (Institutions)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Response Guarantee</p>
                    <p className="text-slate-400">Under 4 hours on college working days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Engineering HQ</p>
                    <p className="text-slate-400">Bengaluru & New Delhi, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Why Colleges Trust CampusOS</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>100% Student data sovereignty (zero third-party data reselling)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Direct UPI & INR integration for student budget management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Offline-tolerant QR gate scanning for dense auditorium basements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
