import React, { useState, useEffect } from 'react';
import { taskService, eventService } from '../services/api';

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

const PRIORITY_COLORS = {
  low: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
  medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  high: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
};

const STATUS_COLORS = {
  todo: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' },
  in_progress: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
  done: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
};

export default function Volunteers() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    eventService.list().then(res => {
      setEvents(res.data?.events || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setTasks([]); return; }
    fetchTasks();
  }, [selectedEventId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.list({ eventId: selectedEventId });
      setTasks(res.data?.tasks || []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingTask) {
        await taskService.update(editingTask._id, form);
      } else {
        await taskService.create({ ...form, eventId: selectedEventId });
      }
      setShowForm(false);
      setEditingTask(null);
      setForm({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      fetchTasks();
    } catch { }
  };

  const handleStatusToggle = async (task) => {
    const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    try {
      await taskService.update(task._id, { status: nextStatus });
      fetchTasks();
    } catch { }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title, description: task.description || '',
      priority: task.priority || 'medium',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
    });
    setShowForm(true);
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            ✅ Volunteer Tasks
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
            Assign, track, and manage event day tasks
          </p>
        </div>
        {selectedEventId && (
          <button
            onClick={() => { setShowForm(true); setEditingTask(null); setForm({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' }); }}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ➕ New Task
          </button>
        )}
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
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total', value: stats.total, icon: '📋', color: '#a5b4fc' },
              { label: 'To Do', value: stats.todo, icon: '📌', color: '#94a3b8' },
              { label: 'In Progress', value: stats.inProgress, icon: '🔄', color: '#fbbf24' },
              { label: 'Done', value: stats.done, icon: '✅', color: '#4ade80' },
            ].map((s, i) => (
              <div key={i} style={{
                ...cardStyle, textAlign: 'center', padding: '1rem',
                animation: `fadeInUp ${0.2 + i * 0.1}s ease-out`,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Task Form Modal */}
          {showForm && (
            <div style={{ ...cardStyle, marginBottom: '1.5rem', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
                  {editingTask ? '✏️ Edit Task' : '➕ New Task'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingTask(null); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Task Title *</label>
                  <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Set up registration desk" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional task details..." />
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select style={inputStyle} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Deadline (optional)</label>
                  <input type="datetime-local" style={inputStyle} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>❌ {error}</p>}
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: 8 }}>
                <button onClick={handleSave} disabled={saving || !form.title.trim()} style={{
                  padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none',
                  background: saving || !form.title.trim() ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {saving ? '⏳ Saving…' : editingTask ? '💾 Update Task' : '➕ Create Task'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingTask(null); }} style={{
                  padding: '0.7rem 1.5rem', borderRadius: 12,
                  border: '1px solid rgba(51,65,85,0.5)', background: 'transparent',
                  color: '#94a3b8', fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
              <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>No tasks yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Create your first task to coordinate volunteers.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((task, i) => {
                const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                const sc = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
                return (
                  <div key={task._id} style={{
                    ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    animation: `fadeInUp ${0.15 + i * 0.05}s ease-out`,
                    opacity: task.status === 'done' ? 0.7 : 1,
                  }}>
                    {/* Status toggle */}
                    <button
                      onClick={() => handleStatusToggle(task)}
                      title={`Status: ${task.status.replace('_', ' ')}`}
                      style={{
                        width: 28, height: 28, borderRadius: 8, border: `2px solid ${sc.border}`,
                        background: task.status === 'done' ? sc.bg : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 2, transition: 'all 0.2s',
                        color: sc.text, fontSize: '0.75rem', fontWeight: 700,
                      }}
                    >
                      {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '◐' : ''}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{
                          color: task.status === 'done' ? '#64748b' : '#e2e8f0',
                          fontSize: '0.95rem', fontWeight: 600,
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text,
                        }}>
                          {task.priority}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
                        }}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.description && (
                        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: 8, color: '#475569', fontSize: '0.7rem' }}>
                        {task.assignedTo && (
                          <span>👤 {task.assignedTo.name || task.assignedTo.email || 'Assigned'}</span>
                        )}
                        {task.deadline && (
                          <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(task)}
                        title="Edit"
                        style={{
                          padding: '0.4rem', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
                          background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', cursor: 'pointer',
                          fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        title="Delete"
                        style={{
                          padding: '0.4rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer',
                          fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!selectedEventId && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
            Select an event to manage tasks
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Choose an event above to assign tasks, track progress, and coordinate volunteers.
          </p>
        </div>
      )}
    </div>
  );
}
