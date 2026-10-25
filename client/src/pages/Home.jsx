import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  QrCode, 
  Award, 
  Users, 
  Flame,
  Check,
  Building2,
  Clock
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('ticket');

  return (
    <div className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32">
      {/* Background radial glows and grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Subtle background tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-sm hover:border-indigo-500/40 transition-colors">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Next-Gen Operating System for Indian College Fests & Clubs
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Run High-Impact College Events with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300">
              Zero Chaos
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            From lightning-fast QR gate check-ins to automated verifiable certificates, volunteer task boards, and fest budgets — everything your college club needs in one modern platform.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all text-base"
            >
              <span>Launch Your Fest Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all text-base"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Explore Live Events</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Showcase / Live Mockup */}
        <div className="relative max-w-5xl mx-auto mb-20">
          {/* Card glow container */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-slate-900/60 shadow-2xl backdrop-blur-xl border border-slate-700/50">
            <div className="rounded-[22px] bg-slate-950/90 p-5 sm:p-8 overflow-hidden">
              {/* Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
                    app.campusos.in/live-event-demo
                  </span>
                </div>

                {/* Interactive Mode Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('ticket')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === 'ticket'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Attendee QR Ticket
                  </button>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === 'scanner'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Live Gate Scanner
                  </button>
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeTab === 'certificate'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Smart Certificate
                  </button>
                </div>
              </div>

              {/* Showcase Content */}
              <div className="pt-6">
                {activeTab === 'ticket' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Digital Pass Card */}
                    <div className="md:col-span-7 bg-gradient-to-br from-slate-900 to-indigo-950/40 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                        <Flame className="w-32 h-32 text-indigo-400" />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Hackathon All-Access Pass
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                            HackDelhi 2026
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            Hosted by ACM Student Chapter
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ CONFIRMED
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <p className="text-xs text-slate-400">Attendee Name</p>
                          <p className="text-sm font-semibold text-white">Rohan Sharma</p>
                          <p className="text-xs text-indigo-300 font-mono">Roll: 23BCS1084 • Team Void</p>
                        </div>
                        {/* Mock QR */}
                        <div className="bg-white p-2 rounded-lg flex flex-col items-center shadow-md">
                          <QrCode className="w-20 h-20 text-slate-900" />
                          <span className="text-[9px] font-mono text-slate-600 mt-1 font-bold">HD26-8941</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Check-in Gate: Main Tech Auditorium</span>
                        <span className="text-emerald-400 font-medium">Valid for Spot Entry</span>
                      </div>
                    </div>

                    {/* Quick Benefit summary */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Anti-Screenshot QR Security
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Cryptographic dynamic tokens prevent duplicate entries and unauthorized ticket transfers.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Auto WhatsApp & Email Dispatch
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Students get their branded digital passes instantly upon confirmation with Google Calendar links.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Offline Sync Ready
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Gate volunteer scanners function reliably even inside underground college auditoriums with weak Wi-Fi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'scanner' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7 bg-slate-900 rounded-2xl p-6 border border-emerald-500/30 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                            Gate 1 Scanner • Online
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">1.1s / scan</span>
                      </div>

                      {/* Simulated Scanner Viewport */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center border border-slate-800">
                        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                        <div className="w-36 h-36 border-2 border-emerald-400/60 rounded-xl relative flex items-center justify-center bg-emerald-500/5">
                          <QrCode className="w-24 h-24 text-emerald-400/80 animate-pulse" />
                        </div>
                        <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PASS VERIFIED: Rohan Sharma (HackDelhi)</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Total Registered</p>
                          <p className="text-sm font-bold text-white">500</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Checked In</p>
                          <p className="text-sm font-bold text-emerald-400">428 (85.6%)</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Pending</p>
                          <p className="text-sm font-bold text-amber-400">72</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          Sub-Second Verification
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          No more 40-minute registration queues outside auditorium doors. Just scan and grant entry.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          Multi-Volunteer Gate Sync
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          10 volunteers on different phones can scan simultaneously with instantaneous duplicate prevention.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'certificate' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7 bg-slate-900 rounded-2xl p-6 border border-violet-500/30 relative">
                      <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 text-center relative overflow-hidden">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                          <Award className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                          Certificate of Excellence
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Proudly presented to</p>
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-200 to-indigo-100 my-2">
                          Priya Patel
                        </p>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto">
                          For outstanding performance as Winner at National Cloud DevFest 2026.
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Cert ID: CP-2026-9812</span>
                          <span className="text-emerald-400 font-mono">✓ Cryptographically Signed</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-violet-400" />
                          One-Click Mass PDF Generation
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Generate hundreds of customized high-resolution PDF certificates in seconds with custom club branding.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-violet-400" />
                          Public Verification URL & QR
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Recruiters and universities can verify authentic certificate credentials on a public portal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 pb-8 border-y border-slate-800/80 text-center">
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">150+</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Campus Tech Clubs</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-tight">85,000+</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Registrations Scanned</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">&lt; 1.2s</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Gate Check-in Speed</p>
          </div>
          <div className="p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-violet-400 tracking-tight">100%</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Verified Certificates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
