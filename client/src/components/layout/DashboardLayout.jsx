import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export default function DashboardLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/dashboard/events', icon: Calendar },
    { label: 'Create Event', path: '/dashboard/events/new', icon: PlusCircle },
    { label: 'Registrations', path: '/dashboard/registrations', icon: Users },
    { label: 'QR Scanner', path: '/dashboard/scanner', icon: ScanLine },
    { label: 'Certificates', path: '/dashboard/certificates', icon: Award },
    { label: 'Volunteer Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { label: 'Budget & Expenses', path: '/dashboard/budget', icon: Wallet },
    { label: 'Announcements', path: '/dashboard/announcements', icon: Megaphone },
    { label: 'Templates', path: '/dashboard/templates', icon: Copy },
    { label: 'Billing & Plan', path: '/dashboard/billing', icon: CreditCard },
  ];

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/70">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-white text-lg">
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
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.club?.name || 'ACM Chapter'}
            </p>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {user?.club?.plan || 'Club Plan'}
            </span>
          </div>
          <Link
            to="/events"
            target="_blank"
            title="View public events page"
            className="text-slate-400 hover:text-white p-1"
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Aarav Mehta'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'lead@campusos.in'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-200">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <span className="text-slate-200 font-medium">Control Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/events/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Event</span>
            </Link>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
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
