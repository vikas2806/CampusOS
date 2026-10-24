import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-brand-500/25">
          <span className="text-2xl font-black tracking-wider text-white">COS</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">CampusOS</h1>
        <p className="text-slate-400 text-sm mb-6">
          Cloud-based event & club management platform for Indian colleges.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Vite + React + Tailwind Ready
        </div>
      </div>
    </div>
  );
}
