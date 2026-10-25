import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  CheckCircle2,
  Filter,
  AlertCircle
} from 'lucide-react';
import { publicService } from '../services/api';

export default function ExploreEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPublicEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await publicService.getEvents();
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to load public events:', err);
      setError(err.response?.data?.message || 'Failed to load campus events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.venue && e.venue.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.club?.name && e.club.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative overflow-hidden pt-8 pb-24 lg:pt-14 lg:pb-32">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Campus Live Showcase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Explore College Fests, Hackathons &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
              Workshops
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Register for inter-college competitions, get instant QR entry passes, and earn verifiable digital certificates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, college name, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xl"
            />
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-rose-500/20 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Error Loading Events</h3>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchPublicEvents}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600"
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 max-w-md mx-auto my-8">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No upcoming events found</h3>
            <p className="text-xs text-slate-400 mb-6">
              {search
                ? 'No events match your search. Try different keywords.'
                : 'There are currently no public published events. Check back soon!'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              <span>Host an Event with CampusOS</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const capacity = evt.capacity || 100;
              const registered = evt.registrationCount || 0;
              const remaining = Math.max(0, capacity - registered);

              return (
                <div
                  key={evt._id}
                  className="group rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 p-6 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 transition-all space-y-4"
                >
                  <div>
                    {/* Club Tag & Spots badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-indigo-400 truncate flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{evt.club?.name || 'College Club'}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {remaining > 0 ? `${remaining} spots open` : 'Full / Waitlist'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {evt.description || 'Join this exciting inter-college event!'}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>
                          {new Date(evt.startDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="truncate">{evt.venue || 'College Auditorium'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 group-hover:shadow-indigo-600/40 transition-all"
                    >
                      <span>Register for Free</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
