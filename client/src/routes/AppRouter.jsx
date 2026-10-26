import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Contact from '../pages/Contact';
import Privacy from '../pages/Privacy';
import ExploreEvents from '../pages/ExploreEvents';
import PublicEvent from '../pages/PublicEvent';
import NotFound from '../pages/NotFound';
import PlaceholderPage from '../pages/PlaceholderPage';

import DashboardHome from '../pages/DashboardHome';
import EventsList from '../pages/EventsList';
import EventForm from '../pages/EventForm';
import EventDetails from '../pages/EventDetails';
import Registrations from '../pages/Registrations';
import QrScanner from '../pages/QrScanner';
import Certificates from '../pages/Certificates';
import Volunteers from '../pages/Volunteers';

export default function AppRouter({ user, onLogout }) {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout user={user} onLogout={onLogout} />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/:slug" element={<PublicEvent />} />
        <Route
          path="/verify"
          element={
            <PlaceholderPage
              title="Verify Certificate"
              description="Enter your unique certificate code or scan the QR code to verify validity."
            />
          }
        />
        <Route
          path="/verify/:code"
          element={
            <PlaceholderPage
              title="Certificate Verification"
              description="Checking authenticity with CampusOS cryptographic credentials."
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      {/* Dashboard Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout user={user} onLogout={onLogout} />}>
        <Route index element={<DashboardHome />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id/edit" element={<EventForm />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="scanner" element={<QrScanner />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="tasks" element={<Volunteers />} />
        <Route
          path="budget"
          element={
            <PlaceholderPage
              title="Budget & Expenses Tracker"
              description="Track sponsorship income, vendor payouts, and fest financials in INR."
            />
          }
        />
        <Route
          path="announcements"
          element={
            <PlaceholderPage
              title="Broadcast Announcements"
              description="Send email alerts and notifications to all confirmed attendees."
            />
          }
        />
        <Route
          path="templates"
          element={
            <PlaceholderPage
              title="Event Templates"
              description="Blueprint library for rapid hackathon and workshop creation."
            />
          }
        />
        <Route
          path="billing"
          element={
            <PlaceholderPage
              title="Billing & Club Plans"
              description="Upgrade to Event Pro, Club Unlimited, or Campus Enterprise."
            />
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
