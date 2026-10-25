import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

export default function PublicLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
