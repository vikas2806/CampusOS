import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  ScanLine,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Eye
} from 'lucide-react';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';

export default function EventsList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await eventService.list(params);
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await eventService.delete(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyPublicLink = (slug) => {
    const url = `${window.location.origin}/events/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2000);
  };

  // Filter events by search query
  const filteredEvents = events.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.venue && e.venue.toLowerCase().includes(q)) ||
      (e.slug && e.slug.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-400" />
            <span>Event Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize, monitor attendee quotas, and control live operations for your campus events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/templates"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Blueprints</span>
          </Link>
          <Link
            to="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          {['all', 'published', 'draft', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={fetchEvents}
            title="Refresh list"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Content */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" message="Loading your club events..." />
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto my-12">
          <ErrorMessage
            error={error}
            title="Failed to Load Events"
            onRetry={fetchEvents}
          />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="max-w-xl mx-auto my-8">
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={
              search
                ? 'No events match your search query. Try clearing filters or searching another title.'
                : 'You have not created any events in this status yet. Launch your next hackathon or workshop today!'
            }
            actionLabel="Create Your First Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const capacity = evt.capacity || 100;
            const regCount = evt.registrationCount || 0;
            const attCount = evt.attendanceCount || 0;
            const pct = Math.min(100, Math.round((regCount / capacity) * 100));

            return (
              <div
                key={evt._id}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Status & Timing header */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : evt.status === 'draft'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      }`}
                    >
                      {evt.status}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(evt.startDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title & Venue */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{evt.venue || 'College Campus'}</span>
                  </p>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Registrations</span>
                      <span className="font-semibold text-white">
                        {regCount} / {capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-amber-400' : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{attCount} Verified Gate Scans</span>
                      <span>{capacity - regCount} seats remaining</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom Strip */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/events/${evt._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all font-semibold"
                    >
                      <span>Control Center</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleCopyPublicLink(evt.slug)}
                      title="Copy Public Link"
                      className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedSlug === evt.slug && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-600 text-[10px] text-white whitespace-nowrap shadow-md">
                          Copied!
                        </span>
                      )}
                    </button>
                    <Link
                      to={`/events/${evt.slug}`}
                      target="_blank"
                      title="View Public Page"
                      className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(evt._id)}
                      title="Delete Event"
                      className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Event?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this event? This action will permanently remove associated registrations, budget entries, and attendee passes.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
