import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records matching your current selection.',
  actionLabel,
  actionTo,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur-sm ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Icon badge */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
        <Icon className="h-8 w-8 text-indigo-400" />
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/40">
          <Sparkles className="h-3 w-3 text-indigo-300" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionTo && actionLabel ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : actionLabel && onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
