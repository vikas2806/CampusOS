import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  fullPage = false,
  inline = false,
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse" />
        {/* Rotating gradient ring */}
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin`}
        />
        {size === 'xl' && (
          <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
        )}
      </div>

      {message && (
        <p className="text-xs font-medium text-slate-400 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        {spinnerContent}
      </div>
    );
  }

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 text-slate-400">
        <Loader2 className={`${sizeClasses[size] || sizeClasses.sm} animate-spin text-indigo-400`} />
        {message && <span className="text-xs">{message}</span>}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {spinnerContent}
    </div>
  );
}
