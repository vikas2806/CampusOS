import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  ListPlus
} from 'lucide-react';
import { eventService, clubService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    capacity: 150,
    rules: '',
    status: 'published',
    isPublic: true,
    schedule: [{ time: '09:00 AM', title: 'Check-in & Badge Distribution', description: 'Main Gate' }],
    customFields: [
      { label: 'College Roll Number', type: 'text', required: true, options: [] },
      { label: 'Academic Year / Branch', type: 'text', required: true, options: [] },
    ],
  });

  // Load existing event data if editing
  useEffect(() => {
    if (isEdit) {
      const loadEvent = async () => {
        try {
          setLoading(true);
          const res = await eventService.get(id);
          if (res.data?.success && res.data.event) {
            const ev = res.data.event;
            setFormData({
              title: ev.title || '',
              description: ev.description || '',
              venue: ev.venue || '',
              startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '',
              endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
              registrationDeadline: ev.registrationDeadline
                ? new Date(ev.registrationDeadline).toISOString().slice(0, 16)
                : '',
              capacity: ev.capacity || 100,
              rules: ev.rules || '',
              status: ev.status || 'published',
              isPublic: ev.isPublic !== false,
              schedule: ev.schedule?.length ? ev.schedule : [],
              customFields: ev.customFields?.length ? ev.customFields : [],
            });
          }
        } catch (err) {
          console.error('Failed to load event for edit:', err);
          setError('Failed to load event details.');
        } finally {
          setLoading(false);
        }
      };
      loadEvent();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Schedule Helpers
  const addScheduleItem = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', title: '', description: '' }],
    }));
  };

  const updateScheduleItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.schedule];
      updated[index][field] = value;
      return { ...prev, schedule: updated };
    });
  };

  const removeScheduleItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  // Custom Fields Helpers
  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', type: 'text', required: false, options: [] }],
    }));
  };

  const updateCustomField = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.customFields];
      updated[index][field] = value;
      return { ...prev, customFields: updated };
    });
  };

  const removeCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      setError('Event title and start date are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const clubId = user?.club?._id || user?.club?.id || (typeof user?.club === 'string' ? user.club : null);

      if (!isEdit && !clubId) {
        // Fetch club id if missing
        const clubRes = await clubService.getMyClub();
        if (!clubRes.data?.club?._id) {
          setError('No active club found for this organizer account.');
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 0,
        clubId: clubId || user?.club?._id,
      };

      if (isEdit) {
        await eventService.update(id, payload);
      } else {
        await eventService.create(payload);
      }

      navigate('/dashboard/events');
    } catch (err) {
      console.error('Failed to save event:', err);
      setError(err.response?.data?.message || 'Failed to save event. Check plan limits.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-900 rounded-xl" />
        <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Roster</span>
        </Link>
        <span className="text-xs text-slate-500 font-mono">
          {isEdit ? `Editing Event: ${id}` : 'Drafting New Campus Fest'}
        </span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEdit ? 'Event Control Center' : 'New Event Blueprint'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isEdit ? 'Edit Event Details' : 'Configure & Publish Event'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure attendee capacity limits, gate check-in questions, and session schedules.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>1. Basic Information</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Event Title <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. HackDelhi 2026 - 36hr National Hackathon"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Campus Venue / Auditorium
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="venue"
                    placeholder="e.g. Dr. APJ Abdul Kalam Auditorium, Main Block"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="published">Published (Accepting Registrations)</option>
                  <option value="draft">Draft (Private to Organisers)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Event Description & Overview
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Describe prizes, eligibility, tracks, team guidelines, or key highlights..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Dates & Capacity */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>2. Date, Timing & Capacity Limits</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Start Date & Time <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Attendee Seat Capacity
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    placeholder="150"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
              />
              <label htmlFor="isPublic" className="text-xs text-slate-300 font-medium cursor-pointer">
                Feature on Public Campus Events Directory (<span className="text-indigo-400 font-mono">/events</span>)
              </label>
            </div>
          </div>

          {/* Section 3: Schedule Items */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>3. Event Schedule & Timeline</span>
              </h2>
              <button
                type="button"
                onClick={addScheduleItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {formData.schedule.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Time (e.g. 10:00 AM)"
                    value={item.time}
                    onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Session Title (e.g. Opening Keynote)"
                    value={item.title}
                    onChange={(e) => updateScheduleItem(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Details / Room (e.g. Auditorium Hall A)"
                    value={item.description}
                    onChange={(e) => updateScheduleItem(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeScheduleItem(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Custom Questionnaire Fields */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <ListPlus className="w-4 h-4" />
                <span>4. Custom Registration Questions</span>
              </h2>
              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {formData.customFields.map((field, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. GitHub Profile / T-shirt Size)"
                    value={field.label}
                    onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="text">Short Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="textarea">Paragraph</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id={`req_${idx}`}
                    checked={field.required}
                    onChange={(e) => updateCustomField(idx, 'required', e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 rounded bg-slate-900 border-slate-800"
                  />
                  <label htmlFor={`req_${idx}`} className="text-xs text-slate-400">
                    Required
                  </label>
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeCustomField(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 5: Rules */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>5. Rules & Guidelines for Attendees</span>
            </h2>
            <textarea
              name="rules"
              rows={3}
              placeholder="e.g. Bring college ID, chargers, code of conduct compliance..."
              value={formData.rules}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/dashboard/events"
              className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Publish Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
