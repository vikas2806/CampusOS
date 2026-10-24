import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import PlaceholderPage from '../pages/PlaceholderPage';

export default function AppRouter({ user, onLogout }) {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout user={user} />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/events"
          element={
            <PlaceholderPage
              title="Explore Campus Events"
              description="Discover tech fests, hackathons, and cultural events happening across colleges."
            />
          }
        />
        <Route
          path="/events/:slug"
          element={
            <PlaceholderPage
              title="Event Details & Registration"
              description="Public event overview, schedule, and attendee registration."
            />
          }
        />
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
        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Sign in to CampusOS"
              description="Access your college club organiser control center."
            />
          }
        />
        <Route
          path="/register"
          element={
            <PlaceholderPage
              title="Create Club Account"
              description="Start organizing world-class college events with CampusOS."
            />
          }
        />
        <Route
          path="/contact"
          element={
            <PlaceholderPage
              title="Contact & Campus Demo"
              description="Request a campus demo or inquire about university partnerships."
            />
          }
        />
        <Route
          path="/privacy"
          element={
            <PlaceholderPage
              title="Privacy & Data Terms"
              description="CampusOS student data protection and event compliance policies."
            />
          }
        />
      </Route>

      {/* Dashboard Protected Routes */}
      <Route path="/dashboard" element={<DashboardLayout user={user} onLogout={onLogout} />}>
        <Route
          index
          element={
            <PlaceholderPage
              title="Dashboard Overview"
              description="Real-time event metrics, ticket scans, attendance rates, and budget balance."
            />
          }
        />
        <Route
          path="events"
          element={
            <PlaceholderPage
              title="Events Management"
              description="Manage all your club events, drafts, and registrations."
            />
          }
        />
        <Route
          path="events/new"
          element={
            <PlaceholderPage
              title="Create New Event"
              description="Configure event details, ticket limits, custom forms, and schedule."
            />
          }
        />
        <Route
          path="events/:id"
          element={
            <PlaceholderPage
              title="Event Control Center"
              description="Live event operations, attendee roster, and broadcast announcements."
            />
          }
        />
        <Route
          path="registrations"
          element={
            <PlaceholderPage
              title="Registrations & Attendees"
              description="Search, filter, and export attendee rosters in CSV format."
            />
          }
        />
        <Route
          path="scanner"
          element={
            <PlaceholderPage
              title="QR Ticket Scanner"
              description="Instant attendee check-in using your device camera."
            />
          }
        />
        <Route
          path="certificates"
          element={
            <PlaceholderPage
              title="Certificates Designer & Issuance"
              description="Design branded PDF certificates and issue with automated QR verification."
            />
          }
        />
        <Route
          path="tasks"
          element={
            <PlaceholderPage
              title="Volunteer Task Management"
              description="Assign tasks, set priorities, and coordinate event day volunteers."
            />
          }
        />
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
