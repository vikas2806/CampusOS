import React, { useState, useEffect } from 'react';
import { announcementService, eventService } from '../services/api';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.6)',
  color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', color: '#94a3b8', fontSize: '0.75rem',
  fontWeight: 600, marginBottom: 6, textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const cardStyle = {
  padding: '1.5rem', borderRadius: 16,
  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)',
  backdropFilter: 'blur(10px)',
};

export default function Announcements() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: '', message: '' });

  useEffect(() => {
    eventService.list().then(res => {
      setEvents(res.data?.events || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setAnnouncements([]); return; }
    fetchAnnouncements();
  }, [selectedEventId]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.list({ eventId: selectedEventId });
      setAnnouncements(res.data?.announcements || []);
    } catch { setAnnouncements([]); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      const res = await announcementService.send({
        eventId: selectedEventId,
        title: form.title,
        message: form.message,
      });
      setMsg({
        type: 'success',
        text: `Announcement sent to ${res.data?.sent || 0} participants!`,
      });
      setForm({ title: '', message: '' });
      fetchAnnouncements();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          📢 Announcements
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
          Broadcast email alerts to all confirmed attendees
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

      {selectedEventId && (
        <>
          {/* Compose */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem', animation: 'fadeInUp 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
              ✉️ Compose Announcement
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>
              This will send an email to all confirmed registrants of <strong style={{ color: '#a5b4fc' }}>{selectedEvent?.title || 'the event'}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Subject / Title *</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Important update about the event"
                />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: 120 }}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Write your announcement here. Supports multi-line text."
                  rows={5}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                onClick={handleSend}
                disabled={sending || !form.title.trim() || !form.message.trim()}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none',
                  background: sending || !form.title.trim() || !form.message.trim()
                    ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  cursor: sending || !form.title.trim() || !form.message.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {sending ? '⏳ Sending…' : '🚀 Send Announcement'}
              </button>
              {msg && (
                <span style={{
                  color: msg.type === 'success' ? '#4ade80' : '#f87171',
                  fontSize: '0.85rem', fontWeight: 500,
                }}>
                  {msg.type === 'success' ? '✅' : '❌'} {msg.text}
                </span>
              )}
            </div>
          </div>

          {/* History */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
              📋 Sent Announcements ({announcements.length})
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>⏳ Loading...</div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No announcements sent yet for this event.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {announcements.map((a, i) => (
                  <div key={a._id || i} style={{
                    padding: '1rem 1.25rem', borderRadius: 12,
                    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)',
                    animation: `fadeInUp ${0.15 + i * 0.05}s ease-out`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>
                        {a.title}
                      </h4>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#4ade80',
                      }}>
                        Sent to {a.sentTo || '—'}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {a.message}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 8, color: '#475569', fontSize: '0.7rem' }}>
                      <span>📅 {new Date(a.createdAt).toLocaleDateString()}</span>
                      <span>🕐 {new Date(a.createdAt).toLocaleTimeString()}</span>
                      {a.createdBy && <span>👤 {a.createdBy.name || a.createdBy.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEventId && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📢</div>
          <h3 style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
            Select an event to send announcements
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Choose an event above to compose and broadcast email alerts to all confirmed registrants.
          </p>
        </div>
      )}
    </div>
  );
}
