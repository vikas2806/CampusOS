import React, { useState, useEffect } from 'react';
import { certificateService, eventService } from '../services/api';

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

const btnPrimary = (disabled) => ({
  padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none',
  background: disabled ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',
});

const cardStyle = {
  padding: '1.5rem', borderRadius: 16,
  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)',
  backdropFilter: 'blur(10px)',
};

const STYLES = ['modern', 'classic', 'minimal', 'elegant'];

export default function Certificates() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({
    title: 'Certificate of Participation',
    subtitle: 'This is proudly presented to',
    body: 'for active participation and successful completion of the event.',
    issuerName: '', issuerTitle: 'Faculty Coordinator',
    signatoryName: '', signatoryTitle: 'Club Lead',
    style: 'modern', logoUrl: '', signatureUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [issueResult, setIssueResult] = useState(null);
  const [tab, setTab] = useState('designer'); // 'designer' | 'issue'
  const [onlyAttended, setOnlyAttended] = useState(true);

  // Fetch events
  useEffect(() => {
    eventService.list().then(res => {
      const evts = res.data?.events || res.data || [];
      setEvents(evts);
    }).catch(() => {});
  }, []);

  // Fetch template when event changes
  useEffect(() => {
    if (!selectedEventId) { setTemplate(null); return; }
    certificateService.getTemplate(selectedEventId).then(res => {
      const t = res.data?.template;
      if (t) {
        setTemplate(t);
        setForm({
          title: t.title || 'Certificate of Participation',
          subtitle: t.subtitle || 'This is proudly presented to',
          body: t.body || '',
          issuerName: t.issuerName || '',
          issuerTitle: t.issuerTitle || 'Faculty Coordinator',
          signatoryName: t.signatoryName || '',
          signatoryTitle: t.signatoryTitle || 'Club Lead',
          style: t.style || 'modern',
          logoUrl: t.logoUrl || '',
          signatureUrl: t.signatureUrl || '',
        });
      } else {
        setTemplate(null);
        setForm({
          title: 'Certificate of Participation',
          subtitle: 'This is proudly presented to',
          body: 'for active participation and successful completion of the event.',
          issuerName: '', issuerTitle: 'Faculty Coordinator',
          signatoryName: '', signatoryTitle: 'Club Lead',
          style: 'modern', logoUrl: '', signatureUrl: '',
        });
      }
    }).catch(() => setTemplate(null));
  }, [selectedEventId]);

  const handleSaveTemplate = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    setMsg(null);
    try {
      await certificateService.saveTemplate({ ...form, eventId: selectedEventId });
      setMsg({ type: 'success', text: 'Template saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save template' });
    } finally {
      setSaving(false);
    }
  };

  const handleIssueCertificates = async () => {
    if (!selectedEventId) return;
    setIssuing(true);
    setIssueResult(null);
    try {
      const res = await certificateService.issueForEvent(selectedEventId, { onlyAttended });
      setIssueResult(res.data);
    } catch (err) {
      setIssueResult({ error: err.response?.data?.message || 'Failed to issue certificates' });
    } finally {
      setIssuing(false);
    }
  };

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            🎓 Certificates
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
            Design branded certificates and issue them to participants
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Select Event</label>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
          style={inputStyle}
        >
          <option value="">— Choose an event —</option>
          {events.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <>
          {/* Tab Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
            {[
              { key: 'designer', icon: '🎨', label: 'Template Designer' },
              { key: 'issue', icon: '📜', label: 'Issue & Download' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 12,
                  background: tab === t.key
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))'
                    : 'rgba(30,41,59,0.5)',
                  color: tab === t.key ? '#a5b4fc' : '#64748b',
                  fontWeight: 600, cursor: 'pointer',
                  border: tab === t.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(51,65,85,0.4)',
                  transition: 'all 0.2s', fontSize: '0.9rem',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'designer' && (
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              {/* Live Preview */}
              <div style={{ ...cardStyle, marginBottom: '1.5rem', padding: '2rem' }}>
                <div style={{
                  padding: '2.5rem', borderRadius: 16, textAlign: 'center',
                  background: form.style === 'modern'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))'
                    : form.style === 'classic'
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.06))'
                      : form.style === 'elegant'
                        ? 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.06))'
                        : 'rgba(30,41,59,0.5)',
                  border: form.style === 'classic'
                    ? '2px solid rgba(245,158,11,0.3)'
                    : form.style === 'elegant'
                      ? '2px solid rgba(236,72,153,0.3)'
                      : '1px solid rgba(99,102,241,0.3)',
                }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                    🔖 Live Preview
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: '0.5rem 0' }}>
                    {form.title || 'Certificate of Participation'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 4 }}>
                    {form.subtitle || 'This is proudly presented to'}
                  </p>
                  <div style={{
                    fontSize: '1.75rem', fontWeight: 700, margin: '1rem 0',
                    background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}>
                    Participant Name
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                    {form.body || 'for active participation...'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '1.5rem' }}>
                    <div>
                      <div style={{ width: 80, borderBottom: '2px solid rgba(148,163,184,0.3)', margin: '0 auto 6px' }} />
                      <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{form.issuerName || 'Issuer Name'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{form.issuerTitle || 'Faculty Coordinator'}</div>
                    </div>
                    <div>
                      <div style={{ width: 80, borderBottom: '2px solid rgba(148,163,184,0.3)', margin: '0 auto 6px' }} />
                      <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{form.signatoryName || 'Signatory Name'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{form.signatoryTitle || 'Club Lead'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.25rem', color: '#475569', fontSize: '0.65rem' }}>
                    {selectedEvent?.title || 'Event'} • Style: {form.style}
                  </div>
                </div>
              </div>

              {/* Template Form */}
              <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem', color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
                  📝 Template Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Certificate Title</label>
                    <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Certificate of Participation" />
                  </div>
                  <div>
                    <label style={labelStyle}>Style</label>
                    <select style={inputStyle} value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}>
                      {STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Subtitle</label>
                    <input style={inputStyle} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="This is proudly presented to" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Body Text</label>
                    <textarea
                      value={form.body}
                      onChange={e => setForm({ ...form, body: e.target.value })}
                      rows={3}
                      placeholder="for active participation and successful completion..."
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Issuer Name</label>
                    <input style={inputStyle} value={form.issuerName} onChange={e => setForm({ ...form, issuerName: e.target.value })} placeholder="Dr. Sharma" />
                  </div>
                  <div>
                    <label style={labelStyle}>Issuer Title</label>
                    <input style={inputStyle} value={form.issuerTitle} onChange={e => setForm({ ...form, issuerTitle: e.target.value })} placeholder="Faculty Coordinator" />
                  </div>
                  <div>
                    <label style={labelStyle}>Signatory Name</label>
                    <input style={inputStyle} value={form.signatoryName} onChange={e => setForm({ ...form, signatoryName: e.target.value })} placeholder="Aarav Mehta" />
                  </div>
                  <div>
                    <label style={labelStyle}>Signatory Title</label>
                    <input style={inputStyle} value={form.signatoryTitle} onChange={e => setForm({ ...form, signatoryTitle: e.target.value })} placeholder="Club Lead" />
                  </div>
                  <div>
                    <label style={labelStyle}>Logo URL (optional)</label>
                    <input style={inputStyle} value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Signature URL (optional)</label>
                    <input style={inputStyle} value={form.signatureUrl} onChange={e => setForm({ ...form, signatureUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={handleSaveTemplate} disabled={saving} style={btnPrimary(saving)}>
                    {saving ? '⏳ Saving…' : '💾 Save Template'}
                  </button>
                  {msg && (
                    <span style={{
                      color: msg.type === 'success' ? '#4ade80' : '#f87171',
                      fontSize: '0.85rem', fontWeight: 500,
                    }}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'issue' && (
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              {/* Issue Certificates */}
              <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
                  📜 Bulk Issue Certificates
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Generate unique certificate verification codes for all confirmed participants of <strong style={{ color: '#a5b4fc' }}>{selectedEvent?.title || 'the selected event'}</strong>.
                </p>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    checked={onlyAttended}
                    onChange={e => setOnlyAttended(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#6366f1' }}
                  />
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    Only for attendees who checked in
                  </span>
                </label>

                <button onClick={handleIssueCertificates} disabled={issuing} style={btnPrimary(issuing)}>
                  {issuing ? '⏳ Issuing…' : '🚀 Issue Certificates'}
                </button>

                {issueResult && (
                  <div style={{
                    marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: 12,
                    background: issueResult.error
                      ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    border: `1px solid ${issueResult.error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                  }}>
                    {issueResult.error ? (
                      <p style={{ color: '#f87171', margin: 0 }}>❌ {issueResult.error}</p>
                    ) : (
                      <div>
                        <p style={{ color: '#4ade80', margin: '0 0 8px', fontWeight: 600 }}>
                          ✅ {issueResult.message}
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                          <span>Total: <strong style={{ color: '#e2e8f0' }}>{issueResult.total}</strong></span>
                          <span>New codes: <strong style={{ color: '#a5b4fc' }}>{issueResult.newIssued}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Download Info */}
              <div style={{ ...cardStyle }}>
                <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
                  ⬇️ Individual Downloads
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Once certificates are issued, participants can download their PDF certificates 
                  from the <strong style={{ color: '#a5b4fc' }}>Registrations</strong> page. Each certificate includes a 
                  unique QR verification code that links to the public verification portal.
                </p>
                <div style={{
                  marginTop: '1rem', padding: '1rem', borderRadius: 12,
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <span style={{ fontSize: '1.25rem' }}>💡</span>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    <strong style={{ color: '#a5b4fc' }}>Tip:</strong> Share the verification link 
                    <code style={{ background: 'rgba(15,23,42,0.5)', padding: '2px 6px', borderRadius: 4, color: '#e2e8f0', fontSize: '0.75rem', marginLeft: 4 }}>
                      /verify/CODE
                    </code> 
                    {' '}with recruiters and institutions to validate certificate authenticity.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedEventId && (
        <div style={{
          ...cardStyle, textAlign: 'center', padding: '4rem 2rem',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
          <h3 style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
            Select an event to get started
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Choose an event above to design its certificate template and issue verified certificates to participants.
          </p>
        </div>
      )}
    </div>
  );
}
