import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function ErrorMessage({
  error,
  title = 'Something went wrong',
  onRetry,
  onDismiss,
  variant = 'danger',
  className = '',
}) {
  if (!error) return null;

  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.response?.data?.message || error?.message || 'An unexpected error occurred.';

  const isWarning = variant === 'warning';

  return (
    <div
      className={`relative flex items-start justify-between gap-3 rounded-2xl p-4 transition-all duration-200 backdrop-blur-sm ${
        isWarning
          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
          : 'bg-red-500/10 border border-red-500/30 text-red-200'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {isWarning ? (
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
        )}

        <div className="space-y-1">
          {title && (
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">
              {title}
            </h4>
          )}
          <p className="text-xs leading-relaxed opacity-80">{errorMessage}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition-colors hover:bg-red-500/30 border border-red-500/40"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
