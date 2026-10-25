import React, { useState, useRef, useEffect } from 'react';
import { checkinService, eventService } from '../services/api';

export default function QrScanner() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('manual'); // 'manual' | 'camera'
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [liveCount, setLiveCount] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    eventService.list().then(res => {
      const evts = res.data?.events || res.data || [];
      setEvents(evts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEvent) { setLiveCount(null); return; }
    const fetchLive = () => {
      checkinService.getLive(selectedEvent).then(res => {
        setLiveCount(res.data?.count ?? res.data?.checkedIn ?? null);
      }).catch(() => {});
    };
    fetchLive();
    const interval = setInterval(fetchLive, 8000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const handleScan = async (scanToken) => {
    const t = (scanToken || token).trim();
    if (!t) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await checkinService.verifyQr(t);
      const data = res.data;
      setResult({ success: true, ...data });
      setHistory(prev => [
        { token: t, success: true, name: data.registration?.name || data.name || 'Unknown', time: new Date(), event: data.registration?.eventTitle || data.event?.title || '' },
        ...prev.slice(0, 49),
      ]);
      setToken('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Scan failed';
      const isDuplicate = err.response?.status === 409 || msg.toLowerCase().includes('already');
      setResult({ success: false, duplicate: isDuplicate, message: msg });
      setHistory(prev => [
        { token: t, success: false, duplicate: isDuplicate, message: msg, time: new Date() },
        ...prev.slice(0, 49),
      ]);
      setError(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan();
  };

  /* Camera Simulator — Simulates a camera scanner with a pulsing viewfinder */
  const CameraSimulator = () => {
    const [simToken, setSimToken] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
          width: 280, height: 280, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
          border: '2px solid rgba(99,102,241,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Scanning line animation */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
            background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
            animation: 'scanLine 2s ease-in-out infinite',
          }} />
          {/* Corner markers */}
          {[
            { top: 20, left: 20 }, { top: 20, right: 20 },
            { bottom: 20, left: 20 }, { bottom: 20, right: 20 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos, width: 28, height: 28,
              borderTop: i < 2 ? '3px solid #818cf8' : 'none',
              borderBottom: i >= 2 ? '3px solid #818cf8' : 'none',
              borderLeft: i % 2 === 0 ? '3px solid #818cf8' : 'none',
              borderRight: i % 2 === 1 ? '3px solid #818cf8' : 'none',
              borderRadius: 4,
            }} />
          ))}
          <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
            Point camera at QR code
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', maxWidth: 300 }}>
          Camera access requires HTTPS in production. Use the token input below to simulate a scan.
        </p>
        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 400 }}>
          <input
            type="text"
            value={simToken}
            onChange={e => setSimToken(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { handleScan(simToken); setSimToken(''); } }}
            placeholder="Paste token to simulate scan…"
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: 10,
              border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.6)',
              color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
            }}
          />
          <button
            onClick={() => { handleScan(simToken); setSimToken(''); }}
            disabled={!simToken.trim() || loading}
            style={{
              padding: '0.75rem 1.25rem', borderRadius: 10, border: 'none',
              background: simToken.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(51,65,85,0.5)',
              color: '#fff', fontWeight: 600, cursor: simToken.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Scan
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 20px; opacity: 0.3; }
          50% { top: calc(100% - 22px); opacity: 1; }
        }
        @keyframes successPulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            🔍 QR Ticket Scanner
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
            Verify attendee gate passes instantly
          </p>
        </div>
        {liveCount !== null && (
          <div style={{
            padding: '0.5rem 1.25rem', borderRadius: 12,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontWeight: 600, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'successPulse 2s infinite' }} />
            {liveCount} checked in
          </div>
        )}
      </div>

      {/* Event selector */}
      <div style={{
        padding: '1.25rem', borderRadius: 16, marginBottom: '1.5rem',
        background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Event (optional — for live counter)
        </label>
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          style={{
            width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.8)',
            color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
          }}
        >
          <option value="">— All Events —</option>
          {events.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[
          { key: 'manual', icon: '⌨️', label: 'Token Input' },
          { key: 'camera', icon: '📷', label: 'Camera Scanner' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 12,
              background: mode === m.key
                ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))'
                : 'rgba(30,41,59,0.5)',
              color: mode === m.key ? '#a5b4fc' : '#64748b',
              fontWeight: 600, cursor: 'pointer',
              border: mode === m.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(51,65,85,0.4)',
              transition: 'all 0.2s',
              fontSize: '0.9rem',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Scanner area */}
      <div style={{
        padding: '2rem', borderRadius: 20, marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.7), rgba(30,41,59,0.5))',
        border: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(12px)',
      }}>
        {mode === 'manual' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '3rem' }}>🎫</div>
            <p style={{ color: '#cbd5e1', textAlign: 'center', maxWidth: 400, fontSize: '0.95rem' }}>
              Enter or paste the QR token from an attendee's gate pass to verify and check them in.
            </p>
            <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 500 }}>
              <input
                ref={inputRef}
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste QR token here…"
                autoFocus
                style={{
                  flex: 1, padding: '0.85rem 1.25rem', borderRadius: 12,
                  border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(15,23,42,0.6)',
                  color: '#e2e8f0', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
              />
              <button
                onClick={() => handleScan()}
                disabled={!token.trim() || loading}
                style={{
                  padding: '0.85rem 2rem', borderRadius: 12, border: 'none',
                  background: token.trim() && !loading
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(51,65,85,0.5)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                  cursor: token.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', minWidth: 100,
                }}
              >
                {loading ? '⏳' : '⚡ Verify'}
              </button>
            </div>
          </div>
        ) : (
          <CameraSimulator />
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div style={{
          padding: '1.5rem', borderRadius: 16, marginBottom: '1.5rem',
          animation: result.success ? 'successPulse 0.6s ease-out, fadeInUp 0.3s ease-out' : 'errorShake 0.5s ease-out, fadeInUp 0.3s ease-out',
          background: result.success
            ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))'
            : result.duplicate
              ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,179,8,0.08))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.08))',
          border: `1px solid ${result.success ? 'rgba(34,197,94,0.35)' : result.duplicate ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '2rem' }}>
              {result.success ? '✅' : result.duplicate ? '⚠️' : '❌'}
            </span>
            <div>
              <h3 style={{
                margin: 0, fontSize: '1.15rem', fontWeight: 700,
                color: result.success ? '#4ade80' : result.duplicate ? '#fbbf24' : '#f87171',
              }}>
                {result.success ? 'Check-In Successful!' : result.duplicate ? 'Already Checked In' : 'Verification Failed'}
              </h3>
              {!result.success && (
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>{result.message}</p>
              )}
            </div>
          </div>
          {result.success && result.registration && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem', padding: '1rem', borderRadius: 12,
              background: 'rgba(15,23,42,0.4)',
            }}>
              {[
                { label: 'Name', value: result.registration.name || '—' },
                { label: 'Email', value: result.registration.email || '—' },
                { label: 'Roll No', value: result.registration.rollNumber || result.registration.rollNo || '—' },
                { label: 'Event', value: result.registration.eventTitle || result.event?.title || '—' },
                { label: 'College', value: result.registration.college || '—' },
                { label: 'Phone', value: result.registration.phone || '—' },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500, marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.5)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(51,65,85,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
              📋 Scan History ({history.length})
            </h3>
            <button
              onClick={() => setHistory([])}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.75rem 1.25rem',
                borderBottom: i < history.length - 1 ? '1px solid rgba(51,65,85,0.3)' : 'none',
                animation: i === 0 ? 'fadeInUp 0.3s ease-out' : 'none',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: h.success ? '#4ade80' : h.duplicate ? '#fbbf24' : '#f87171',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>
                    {h.success ? h.name : (h.message || 'Failed')}
                  </div>
                  {h.event && <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{h.event}</div>}
                </div>
                <div style={{ color: '#475569', fontSize: '0.7rem', flexShrink: 0 }}>
                  {h.time.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
