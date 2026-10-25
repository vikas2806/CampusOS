import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  Mail,
  Zap
} from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Explore Events', path: '/events', icon: Calendar },
    { label: 'Features', path: '/#features', hash: '#features' },
    { label: 'Pricing', path: '/#pricing', hash: '#pricing' },
    { label: 'Verify Pass', path: '/verify', icon: ShieldCheck },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  const handleNavClick = (link, e) => {
    if (link.hash) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.querySelector(link.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      setDropdownOpen(false);
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase font-bold -mt-1">
                College Event Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path && !link.hash;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-500/10 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-indigo-400 opacity-90" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 text-white shadow-sm transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="text-left text-xs max-w-[120px] truncate">
                    <div className="font-semibold text-slate-200 truncate">{user.name || 'User'}</div>
                    <div className="text-[10px] text-indigo-400 capitalize">{user.role || 'Member'}</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/10 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      <span>Organizer Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Launch Event</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={(e) => handleNavClick(link, e)}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
              >
                <span>{link.label}</span>
                {link.icon && <link.icon className="w-4 h-4 text-indigo-400" />}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  Open Organizer Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30"
                >
                  Launch Event for Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
