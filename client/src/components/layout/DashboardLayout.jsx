import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Users,
  ScanLine,
  Award,
  CheckSquare,
  Wallet,
  Megaphone,
  Copy,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Building2,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useAuth();

  // Auth protection: redirect to login if unauthenticated once loading completes
  useEffect(() => {
    if (!loading && !user && !localStorage.getItem('campusos_token')) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/dashboard/events', icon: Calendar },
    { label: 'Create Event', path: '/dashboard/events/new', icon: PlusCircle },
    { label: 'Registrations', path: '/dashboard/registrations', icon: Users },
    { label: 'QR Scanner', path: '/dashboard/scanner', icon: ScanLine, badge: 'Gate Live' },
    { label: 'Certificates', path: '/dashboard/certificates', icon: Award },
    { label: 'Volunteer Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { label: 'Budget & Expenses', path: '/dashboard/budget', icon: Wallet },
    { label: 'Announcements', path: '/dashboard/announcements', icon: Megaphone },
    { label: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
    { label: 'Templates', path: '/dashboard/templates', icon: Copy },
    { label: 'Billing & Plan', path: '/dashboard/billing', icon: CreditCard },
  ];

  // Map route to human readable breadcrumb title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Overview';
    if (p === '/dashboard/events') return 'Event Management';
    if (p === '/dashboard/events/new') return 'Create New Event';
    if (p.startsWith('/dashboard/events/')) return 'Event Control Center';
    if (p === '/dashboard/registrations') return 'Attendee Registrations';
    if (p === '/dashboard/scanner') return 'QR Ticket Scanner';
    if (p === '/dashboard/certificates') return 'Certificate Designer & Issuance';
    if (p === '/dashboard/tasks') return 'Volunteer Task Manager';
    if (p === '/dashboard/budget') return 'Budget & Expenses Tracker';
    if (p === '/dashboard/announcements') return 'Broadcast Announcements';
    if (p === '/dashboard/reports') return 'Event Reports';
    if (p === '/dashboard/templates') return 'Event Blueprints';
    if (p === '/dashboard/billing') return 'Billing & Subscriptions';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    navigate('/login');
  };

  const club = user?.club;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static backdrop-blur-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-lg">
              Campus<span className="text-indigo-400">OS</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Club context pill */}
        <div className="px-4 py-3 mx-3 my-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between shadow-sm">
          <div className="truncate flex-1 mr-2">
            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{club?.name || 'ACM Student Chapter'}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                {club?.plan ? club.plan.replace('_', ' ') : 'Starter'}
              </span>
              {club?.institution && (
                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                  {club.institution}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/events"
            target="_blank"
            title="View public events page"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md shadow-indigo-600/20 uppercase">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Aarav Mehta'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.role || 'Lead Organiser'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar for mobile & fast actions */}
        <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-200">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <span className="text-white font-semibold">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/events/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Scanner Gateway Ready</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
