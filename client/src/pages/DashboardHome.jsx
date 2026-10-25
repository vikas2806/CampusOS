import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  Wallet,
  CheckSquare,
  TrendingUp,
  PlusCircle,
  ScanLine,
  Award,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getStats();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 rounded-3xl bg-slate-900 border border-slate-800" />
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
        {/* Charts & Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 rounded-2xl bg-slate-900 border border-slate-800" />
          <div className="lg:col-span-4 h-80 rounded-2xl bg-slate-900 border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const club = data?.club || user?.club || {};
  const upcomingEvents = data?.upcomingEvents || [];
  const recentRegistrations = data?.recentRegistrations || [];
  const chartData = data?.chartData || [];

  // Format currency in INR
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Find max registration count in chart data for scaling bar heights
  const maxRegInChart = Math.max(...chartData.map((d) => d.registrations || 0), 10);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome / Club Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {club.plan ? `${club.plan.replace('_', ' ')} Plan` : 'Starter Club'}
              </span>
              <span className="text-xs text-slate-400">
                {club.institution || 'Indian College Campus'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Organiser'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Managing <span className="text-white font-semibold">{club.name || 'Student Chapter'}</span>. 
              You have <span className="text-indigo-400 font-semibold">{metrics.upcomingCount || 0} upcoming fests</span> and{' '}
              <span className="text-emerald-400 font-semibold">{metrics.totalRegistrations || 0} total confirmed participants</span>.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
            <Link
              to="/dashboard/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
            >
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span>Launch Gate Scanner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Events</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{metrics.totalEvents || 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-indigo-400 font-semibold">{metrics.upcomingCount || 0}</span>
              <span>upcoming</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{metrics.completedCount || 0}</span>
              <span>completed</span>
            </div>
          </div>
        </div>

        {/* Card 2: Registrations */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Registrations</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{metrics.totalRegistrations || 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{metrics.totalAttended || 0}</span>
              <span>checked in</span>
              <span>({metrics.attendanceRate || '0%'} rate)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Budget Spent */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fest Budget Allocated</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">
              {formatINR(metrics.totalBudgetAllocated)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">
                {formatINR(metrics.totalBudgetSpent)}
              </span>
              <span>utilized</span>
            </div>
          </div>
        </div>

        {/* Card 4: Volunteer Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Volunteer Ops Tasks</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">
              {(metrics.pendingTasks || 0) + (metrics.completedTasks || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{metrics.completedTasks || 0} done</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{metrics.pendingTasks || 0} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Quick Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Event Registration & Attendance Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Event Registrations vs Spot Attendance</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Performance across recent campus fests and technical workshops
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-slate-300">Registered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">Attended</span>
              </div>
            </div>
          </div>

          {/* Chart Rendering */}
          {chartData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No event metrics yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Create and publish your first event to start monitoring registrations and live gate check-ins.
              </p>
              <Link
                to="/dashboard/events/new"
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80 px-2">
                {chartData.map((d, idx) => {
                  const regHeight = Math.max(12, Math.round((d.registrations / maxRegInChart) * 160));
                  const attHeight = Math.max(8, Math.round((d.attendance / maxRegInChart) * 160));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                        {d.registrations} registered • {d.attendance} attended
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 max-w-[48px]">
                        <div
                          style={{ height: `${regHeight}px` }}
                          className="w-full rounded-t-md bg-indigo-500/80 group-hover:bg-indigo-400 transition-all"
                        />
                        <div
                          style={{ height: `${attHeight}px` }}
                          className="w-full rounded-t-md bg-emerald-500/80 group-hover:bg-emerald-400 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate w-full text-center mt-2">
                        {d.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Showing last {chartData.length} events</span>
                <span>Values scaled to maximum event registrations</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Recent Live Registrations Feed */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <span>Recent Registrations</span>
              </h2>
              <Link
                to="/dashboard/registrations"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View All
              </Link>
            </div>

            {recentRegistrations.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No attendee registrations recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentRegistrations.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-white truncate">{r.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{r.eventTitle}</p>
                    </div>
                    <div>
                      {r.attended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              to="/dashboard/registrations"
              className="w-full text-center block py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Export Attendee Roster (CSV)
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Events Roster */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Upcoming Fests & Events</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active events scheduled for your college club
            </p>
          </div>
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>Manage All Events</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No upcoming events scheduled</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ready to launch your college hackathon or coding fest? Choose from pre-configured blueprints.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                to="/dashboard/events/new"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm"
              >
                Create Event
              </Link>
              <Link
                to="/dashboard/templates"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Use Blueprint
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((evt) => {
              const capacity = evt.capacity || 100;
              const count = evt.registrationCount || 0;
              const pct = Math.min(100, Math.round((count / capacity) * 100));

              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {evt.status}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(evt.startDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate">{evt.title}</h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{evt.venue || 'College Auditorium'}</p>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Registrations</span>
                        <span className="font-semibold text-white">
                          {count} / {capacity} ({pct}%)
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
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <Link
                      to={`/dashboard/events/${evt.id}`}
                      className="font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Event Operations
                    </Link>
                    <Link
                      to="/dashboard/scanner"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>Gate Scan</span>
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
