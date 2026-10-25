import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  ExternalLink,
  Copy,
  ScanLine,
  Wallet,
  CheckSquare,
  Megaphone,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Send,
  Plus,
  RefreshCw,
  Award
} from 'lucide-react';
import {
  eventService,
  registrationService,
  checkinService,
  budgetService,
  taskService,
  announcementService
} from '../services/api';

export default function EventDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Tab Data States
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');

  const [budget, setBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', category: 'food', planned: 0, actual: 0, vendor: '' });
  const [addingExpense, setAddingExpense] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignedToName: '', priority: 'medium' });
  const [addingTask, setAddingTask] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annForm, setAnnForm] = useState({ subject: '', message: '' });
  const [sendingAnn, setSendingAnn] = useState(false);
  const [annSuccess, setAnnSuccess] = useState('');

  // Load Event Details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.get(id);
      if (res.data?.success && res.data.event) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Event not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Tab: Registrations
  const fetchRegistrations = async () => {
    try {
      setRegLoading(true);
      const res = await registrationService.list({ eventId: id, search: regSearch });
      if (res.data?.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  // Tab: Budget
  const fetchBudget = async () => {
    try {
      setBudgetLoading(true);
      const res = await budgetService.get(id);
      if (res.data?.success) {
        setBudget(res.data.budget);
      }
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setBudgetLoading(false);
    }
  };

  // Tab: Tasks
  const fetchTasks = async () => {
    try {
      setTaskLoading(true);
      const res = await taskService.list({ eventId: id });
      if (res.data?.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setTaskLoading(false);
    }
  };

  // Tab: Announcements
  const fetchAnnouncements = async () => {
    try {
      setAnnLoading(true);
      const res = await announcementService.list({ eventId: id });
      if (res.data?.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setAnnLoading(false);
    }
  };

  // Trigger lazy fetches when tab changes
  useEffect(() => {
    if (activeTab === 'attendees') fetchRegistrations();
    if (activeTab === 'budget') fetchBudget();
    if (activeTab === 'tasks') fetchTasks();
    if (activeTab === 'announcements') fetchAnnouncements();
  }, [activeTab, id]);

  const handleCopyLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/events/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualCheckin = async (regId) => {
    try {
      await checkinService.manualCheckin(regId);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === regId ? { ...r, attended: true } : r))
      );
      if (event) {
        setEvent((prev) => ({
          ...prev,
          attendanceCount: (prev.attendanceCount || 0) + 1,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Manual checkin failed');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await registrationService.exportCsv({ eventId: id });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event?.slug || 'event'}-attendees.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.actual) return;
    try {
      setAddingExpense(true);
      await budgetService.addExpense(id, newExpense);
      setNewExpense({ title: '', category: 'food', planned: 0, actual: 0, vendor: '' });
      fetchBudget();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setAddingExpense(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      setAddingTask(true);
      await taskService.create({ ...newTask, eventId: id });
      setNewTask({ title: '', assignedToName: '', priority: 'medium' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setAddingTask(false);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.subject || !annForm.message) return;
    try {
      setSendingAnn(true);
      setAnnSuccess('');
      const res = await announcementService.send({ ...annForm, eventId: id });
      setAnnSuccess(res.data?.message || 'Broadcast email queued successfully!');
      setAnnForm({ subject: '', message: '' });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSendingAnn(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-900 rounded-lg" />
        <div className="h-48 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-rose-500/20 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Event Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <Link
          to="/dashboard/events"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const capacity = event.capacity || 100;
  const regCount = event.registrationCount || 0;
  const attCount = event.attendanceCount || 0;
  const pct = Math.min(100, Math.round((regCount / capacity) * 100));
  const attRate = regCount > 0 ? Math.round((attCount / regCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
        <span className="text-xs text-slate-500 font-mono">ID: {event._id}</span>
      </div>

      {/* Main Event Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                event.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {event.status}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {new Date(event.startDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              {event.venue || 'College Auditorium'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="font-semibold text-white">
              {regCount} / {capacity} Registered ({pct}%)
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{attCount} Checked In ({attRate}%)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>{copied ? 'Link Copied!' : 'Copy Public URL'}</span>
          </button>
          <Link
            to={`/events/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
            <span>Public Page</span>
          </Link>
          <Link
            to={`/dashboard/events/${event._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit</span>
          </Link>
          <Link
            to="/dashboard/scanner"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan Tickets</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview & Schedule', icon: Calendar },
          { key: 'attendees', label: `Attendees (${regCount})`, icon: Users },
          { key: 'budget', label: 'Budget & Expenses', icon: Wallet },
          { key: 'tasks', label: 'Volunteer Tasks', icon: CheckSquare },
          { key: 'announcements', label: 'Announcements', icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Description */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Event Summary</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {event.description || 'No description provided for this event.'}
              </p>
            </div>

            {/* Schedule Timeline */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Session Timeline</span>
              </h3>
              {event.schedule?.length === 0 ? (
                <p className="text-xs text-slate-500">No timeline items added.</p>
              ) : (
                <div className="space-y-3">
                  {event.schedule.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-4 text-xs">
                      <span className="font-mono font-bold text-indigo-400 shrink-0 w-20">{item.time}</span>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rules */}
            {event.rules && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Rules & Instructions</h3>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {event.rules}
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacity & Gate Scan Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Seats Claimed</span>
                  <span className="font-semibold text-white">{regCount} / {capacity}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${pct}%` }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Gate Check-in Rate</span>
                  <span className="font-semibold text-emerald-400">{attRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${attRate}%` }} className="h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Operations</h3>
              <Link
                to="/dashboard/certificates"
                className="w-full inline-flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" />
                  <span>Issue Certificates</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-slate-500" />
              </Link>
              <button
                onClick={handleExportCsv}
                className="w-full inline-flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Attendee CSV</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendees */}
      {activeTab === 'attendees' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Attendee Roster</h3>
              <p className="text-xs text-slate-400">Manage registrations and spot check-ins for this event.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {regLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading attendees...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No registrations recorded yet for this event.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">Attendee</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {registrations.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-900/50">
                      <td className="py-3.5 px-3 font-semibold text-white">{r.name}</td>
                      <td className="py-3.5 px-3 text-slate-400">{r.email}</td>
                      <td className="py-3.5 px-3">
                        {r.attended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Pending Entry
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {!r.attended && (
                          <button
                            onClick={() => handleManualCheckin(r._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 font-semibold"
                          >
                            Mark Checked In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Budget */}
      {activeTab === 'budget' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Event Budget & Expense Ledger</h3>
              <p className="text-xs text-slate-400">Track stage sound, banners, prizes, and vendor payouts in INR.</p>
            </div>
            <Link
              to="/dashboard/budget"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Open Full Budget Manager →
            </Link>
          </div>

          {/* Quick Expense Entry Form */}
          <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expense Item</label>
              <input
                type="text"
                placeholder="e.g. Sound & Stage Lighting"
                required
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="food">Food & Snacks</option>
                <option value="marketing">Banners & Swag</option>
                <option value="logistics">Sound & Stage</option>
                <option value="prizes">Cash Prizes</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Amount (₹ INR)</label>
              <input
                type="number"
                placeholder="₹ 5000"
                required
                value={newExpense.actual || ''}
                onChange={(e) => setNewExpense({ ...newExpense, actual: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={addingExpense}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
              >
                {addingExpense ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </form>

          {/* Expenses List */}
          <div className="space-y-2">
            {budget?.expenses?.length ? (
              budget.expenses.map((exp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{exp.title}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{exp.category} • {exp.vendor || 'Campus Vendor'}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    ₹{Number(exp.actual || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No expenses recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Tasks */}
      {activeTab === 'tasks' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Volunteer Task Assignments</h3>
              <p className="text-xs text-slate-400">Coordinate shifts, water distribution, and gate check-in duties.</p>
            </div>
            <Link
              to="/dashboard/tasks"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Open Volunteer Hub →
            </Link>
          </div>

          {/* Quick Task Form */}
          <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Task Responsibility</label>
              <input
                type="text"
                placeholder="e.g. Auditorium Gate 1 QR Scanner Volunteer"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assignee Name</label>
              <input
                type="text"
                placeholder="e.g. Rohit Verma"
                value={newTask.assignedToName}
                onChange={(e) => setNewTask({ ...newTask, assignedToName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={addingTask}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white"
              >
                {addingTask ? 'Adding...' : 'Assign Task'}
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-2">
            {tasks.length ? (
              tasks.map((t) => (
                <div key={t._id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{t.title}</p>
                    <p className="text-[11px] text-slate-400">Assigned: {t.assignedToName || 'Unassigned'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    t.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No tasks assigned for this event.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Announcements */}
      {activeTab === 'announcements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Broadcast Email to Confirmed Attendees</h3>
            <p className="text-xs text-slate-400">
              Send instant email updates, problem statement links, or room change alerts to all {regCount} attendees.
            </p>
          </div>

          {annSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{annSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Line</label>
              <input
                type="text"
                placeholder="e.g. Round 1 Shortlist & Presentation Room Shift"
                required
                value={annForm.subject}
                onChange={(e) => setAnnForm({ ...annForm, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                placeholder="Dear Participants, please report to Auditorium Hall B with your student IDs..."
                value={annForm.message}
                onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sendingAnn}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingAnn ? 'Broadcasting...' : 'Send Email Broadcast'}</span>
            </button>
          </form>

          {/* Previous broadcasts list */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Broadcast History</h4>
            {announcements.length ? (
              announcements.map((a) => (
                <div key={a._id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{a.subject}</p>
                    <span className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{a.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No broadcasts sent yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
