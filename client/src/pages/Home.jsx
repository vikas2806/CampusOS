import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ShieldCheck, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden pt-12 pb-24 lg:pt-20">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>The Next-Gen Event Platform for Indian Colleges</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-6">
          Effortless Campus Events, Hackathons &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
            QR Check-ins
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          From registrations and volunteer tasks to on-spot QR scanning and tamper-proof digital certificates — run your student club like a high-growth tech startup.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all text-base"
          >
            <span>Start Free for Your Club</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-base"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Explore Events</span>
          </Link>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Instant QR Passes</h3>
            <p className="text-xs text-slate-400 mt-1">One-second check-in at campus gates</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Verifiable Certificates</h3>
            <p className="text-xs text-slate-400 mt-1">PDF certificates with QR verification</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Volunteer Ops</h3>
            <p className="text-xs text-slate-400 mt-1">Task delegation & budget tracking</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Club Blueprints</h3>
            <p className="text-xs text-slate-400 mt-1">Ready templates for hackathons</p>
          </div>
        </div>
      </div>
    </div>
  );
}
