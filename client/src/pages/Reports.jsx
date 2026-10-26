import React, { useState, useEffect } from 'react';
import { reportService, eventService } from '../services/api';

const cardStyle = {
  padding: '1.5rem', borderRadius: 16,
  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)',
  backdropFilter: 'blur(10px)',
};

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.6)',
  color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
};

const labelStyle = {
  display: 'block', color: '#94a3b8', fontSize: '0.75rem',
  fontWeight: 600, marginBottom: 6, textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export default function Reports() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    eventService.list().then(res => {
      setEvents(res.data?.events || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setReport(null); return; }
    setLoading(true);
    setError('');
    reportService.getEventReport(selectedEventId).then(res => {
      setReport(res.data?.report || null);
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to load report');
      setReport(null);
    }).finally(() => setLoading(false));
  }, [selectedEventId]);

  const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => (
    <div style={{
      ...cardStyle, padding: '1.25rem', textAlign: 'center',
      animation: `fadeInUp ${0.2 + delay}s ease-out`,
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: color || '#e2e8f0' }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          📊 Event Reports
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
          Comprehensive post-event analytics and insights
        </p>
      </div>

      {/* Event Selector */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Select Event</label>
        <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={inputStyle}>
          <option value="">— Choose an event —</option>
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ Generating report...</div>
      )}

      {error && (
        <div style={{ ...cardStyle, padding: '1.25rem', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ color: '#f87171', margin: 0 }}>❌ {error}</p>
        </div>
      )}

      {report && !loading && (
        <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          {/* Event Info */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              flexShrink: 0,
            }}>📅</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 700 }}>
                {report.event?.title || 'Event Report'}
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 4, color: '#64748b', fontSize: '0.8rem' }}>
                {report.event?.startDate && <span>📅 {new Date(report.event.startDate).toLocaleDateString()}</span>}
                {report.event?.club?.name && <span>🏛️ {report.event.club.name}</span>}
                {report.event?.capacity && <span>👥 Capacity: {report.event.capacity}</span>}
              </div>
            </div>
          </div>

          {/* Registration Stats */}
          <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Registration Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StatCard icon="✅" label="Confirmed" value={report.registrations?.confirmed ?? 0} color="#4ade80" delay={0} />
            <StatCard icon="🎯" label="Attended" value={report.registrations?.attended ?? 0} color="#a5b4fc" delay={0.05} />
            <StatCard icon="📈" label="Attendance Rate" value={report.registrations?.attendanceRate || '0%'} color="#fbbf24" delay={0.1} />
            <StatCard icon="📊" label="Capacity Filled" value={report.registrations?.capacityFilled || 'N/A'} color="#38bdf8" delay={0.15} />
            <StatCard icon="⏳" label="Waitlisted" value={report.registrations?.waitlisted ?? 0} color="#fb923c" delay={0.2} />
            <StatCard icon="❌" label="Cancelled" value={report.registrations?.cancelled ?? 0} color="#f87171" delay={0.25} />
          </div>

          {/* Budget Summary */}
          {report.budget && (
            <>
              <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Financial Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <StatCard icon="💰" label="Budget Allocated" value={`₹${(report.budget.allocated || 0).toLocaleString('en-IN')}`} color="#a5b4fc" delay={0} />
                <StatCard icon="💸" label="Actual Expense" value={`₹${(report.budget.actualExpense || 0).toLocaleString('en-IN')}`} color="#f87171" delay={0.05} />
                <StatCard icon="💵" label="Total Income" value={`₹${(report.budget.totalIncome || 0).toLocaleString('en-IN')}`} color="#4ade80" delay={0.1} />
                <StatCard
                  icon={report.budget.totalIncome - report.budget.actualExpense >= 0 ? '✅' : '⚠️'}
                  label="Net Balance"
                  value={`₹${(report.budget.totalIncome - report.budget.actualExpense).toLocaleString('en-IN')}`}
                  color={report.budget.totalIncome - report.budget.actualExpense >= 0 ? '#4ade80' : '#fbbf24'}
                  delay={0.15}
                />
              </div>
            </>
          )}

          {/* Task Stats */}
          {report.tasks && report.tasks.total > 0 && (
            <>
              <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Volunteer Tasks
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <StatCard icon="📋" label="Total Tasks" value={report.tasks.total} color="#a5b4fc" delay={0} />
                <StatCard icon="📌" label="To Do" value={report.tasks.todo} color="#94a3b8" delay={0.05} />
                <StatCard icon="🔄" label="In Progress" value={report.tasks.inProgress} color="#fbbf24" delay={0.1} />
                <StatCard icon="✅" label="Completed" value={report.tasks.done} color="#4ade80" delay={0.15} />
              </div>
            </>
          )}

          {/* Announcements Count */}
          {report.announcementsCount > 0 && (
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
              }}>📢</div>
              <div>
                <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700 }}>{report.announcementsCount} Announcements</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>sent during this event</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedEventId && !loading && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
            Select an event to view reports
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Choose an event above to see registration analytics, financial summaries, task progress, and more.
          </p>
        </div>
      )}
    </div>
  );
}
