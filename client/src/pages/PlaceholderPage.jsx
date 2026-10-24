import React from 'react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm">
          {description || 'This module is connecting to your active CampusOS club workspace.'}
        </p>
      </div>
    </div>
  );
}
