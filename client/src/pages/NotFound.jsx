import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full">
        <span className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-400">
          404
        </span>
        <h1 className="text-2xl font-bold text-white mt-4 mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The event, page, or campus resource you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
