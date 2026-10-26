import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Building2,
  Mail,
  Phone,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { eventService, registrationService, checkinService } from '../services/api';

export default function Registrations() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [attendedFilter, setAttendedFilter] = useState('all'); // 'all', 'true', 'false'
  const [selectedReg, setSelectedReg] = useState(null); // for custom answers modal
  const [exporting, setExporting] = useState(false);

  // Load events list first
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await eventService.list();
        if (res.data?.success) {
          const list = res.data.events || [];
          setEvents(list);
          if (list.length > 0) {
            setSelectedEventId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load events for roster:', err);
        setError('Failed to load events list.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch registrations for selected event
  const fetchRegistrations = async () => {
    if (!selectedEventId) {
      setRegistrations([]);
      return;
    }
    try {
      setRegLoading(true);
      const params = { eventId: selectedEventId };
      if (attendedFilter !== 'all') params.attended = attendedFilter;
      if (search) params.search = search;

      const res = await registrationService.list(params);
      if (res.data?.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations();
    }
  }, [selectedEventId, attendedFilter]);

  // Handle search submit or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRegistrations();
  };

  // Manual Check-in toggle
  const handleManualCheckin = async (regId) => {
    try {
      await checkinService.manualCheckin(regId);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === regId ? { ...r, attended: true, checkedInAt: new Date() } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Checkin failed');
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    if (!selectedEventId) return;
    try {
      setExporting(true);
      const params = { eventId: selectedEventId };
      if (attendedFilter !== 'all') params.attended = attendedFilter;
      const res = await registrationService.exportCsv(params);

      const activeEvent = events.find((e) => e._id === selectedEventId);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeEvent?.slug || 'event'}-attendees.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const activeEvent = events.find((e) => e._id === selectedEventId);
  const totalCount = registrations.length;
  const attendedCount = registrations.filter((r) => r.attended).length;
  const attRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" />
            <span>Attendee Registrations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search participants, monitor spot attendance, and export accredited rosters for institutional audits.
          </p>
        </div>

        {selectedEventId && (
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating CSV...' : 'Export Attendee CSV'}</span>
          </button>
        )}
      </div>

      {/* Event Selector & Stats Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Event Roster
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({new Date(e.startDate).toLocaleDateString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {activeEvent && (
            <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400">Total Registered</p>
                <p className="text-base font-bold text-white">{totalCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400">Checked In</p>
                <p className="text-base font-bold text-emerald-400">{attendedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400">Gate Rate</p>
                <p className="text-base font-bold text-indigo-400">{attRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* Attended Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs w-full md:w-auto">
            <button
              onClick={() => setAttendedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                attendedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Attendees
            </button>
            <button
              onClick={() => setAttendedFilter('true')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                attendedFilter === 'true'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setAttendedFilter('false')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                attendedFilter === 'false'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Entry
            </button>
            <button
              onClick={fetchRegistrations}
              title="Refresh roster"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden">
        {regLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 animate-pulse">
            Loading registrations for selected event...
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No attendees match your filter</h3>
            <p className="text-xs text-slate-500">
              {search
                ? 'Try searching with a different name or email query.'
                : 'Share the public event registration link to collect attendee passes.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Gate Status</th>
                  <th className="py-3 px-3">Registered At</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {registrations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-white">{r.name}</p>
                      {r.certificateCode && (
                        <span className="text-[10px] text-violet-400 font-mono">
                          Cert: {r.certificateCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">{r.email}</td>
                    <td className="py-3.5 px-3 text-slate-400">{r.phone || '—'}</td>
                    <td className="py-3.5 px-3">
                      {r.attended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          Pending Entry
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {r.answers?.length > 0 && (
                        <button
                          onClick={() => setSelectedReg(r)}
                          title="View Questionnaire Answers"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white"
                        >
                          Answers ({r.answers.length})
                        </button>
                      )}
                      {!r.attended && (
                        <button
                          onClick={() => handleManualCheckin(r._id)}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 font-semibold"
                        >
                          Check In
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

      {/* Answers Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedReg.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedReg.email}</p>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Custom Questionnaire Responses
              </h4>
              {selectedReg.answers?.map((ans, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <p className="font-semibold text-slate-400">{ans.label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{ans.value || '—'}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
