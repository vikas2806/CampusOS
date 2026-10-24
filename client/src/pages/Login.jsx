import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to manage your campus club events & attendee rosters
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('lead@campusos.in')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left bg-slate-800/80 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
            >
              <span>Organiser Lead</span>
              <span className="text-[10px] text-indigo-400 font-mono">ACM</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('volunteer@campusos.in')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left bg-slate-800/80 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
            >
              <span>Gate Volunteer</span>
              <span className="text-[10px] text-emerald-400 font-mono">Scan</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@campusos.in')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left bg-slate-800/80 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
            >
              <span>Faculty Admin</span>
              <span className="text-[10px] text-amber-400 font-mono">Dean</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student@campusos.in')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-left bg-slate-800/80 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
            >
              <span>Student Hacker</span>
              <span className="text-[10px] text-cyan-400 font-mono">User</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lead@campusos.in"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New to CampusOS?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Create a Club Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
