import React, { useState, useEffect } from 'react';
import { budgetService, eventService } from '../services/api';

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

export default function Budget() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('expenses');
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'General', expected: '', actual: '', paidBy: '' });
  const [incomeForm, setIncomeForm] = useState({ source: '', description: '', expected: '', actual: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    eventService.list().then(res => {
      setEvents(res.data?.events || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setBudget(null); return; }
    fetchBudget();
  }, [selectedEventId]);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await budgetService.get(selectedEventId);
      setBudget(res.data?.budget || null);
    } catch { setBudget(null); }
    finally { setLoading(false); }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description.trim()) return;
    setSaving(true);
    try {
      await budgetService.addExpense(selectedEventId, {
        ...expenseForm,
        expected: Number(expenseForm.expected) || 0,
        actual: Number(expenseForm.actual) || 0,
      });
      setExpenseForm({ description: '', category: 'General', expected: '', actual: '', paidBy: '' });
      fetchBudget();
      setMsg({ type: 'success', text: 'Expense added!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setSaving(false); }
  };

  const handleAddIncome = async () => {
    if (!incomeForm.source.trim()) return;
    setSaving(true);
    try {
      await budgetService.addIncome(selectedEventId, {
        ...incomeForm,
        expected: Number(incomeForm.expected) || 0,
        actual: Number(incomeForm.actual) || 0,
      });
      setIncomeForm({ source: '', description: '', expected: '', actual: '' });
      fetchBudget();
      setMsg({ type: 'success', text: 'Income added!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setSaving(false); }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await budgetService.deleteExpense(selectedEventId, expenseId);
      fetchBudget();
    } catch { }
  };

  const handleExportCsv = async () => {
    try {
      const res = await budgetService.exportCsv(selectedEventId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-${selectedEventId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { }
  };

  // Computed summary
  const expenses = budget?.expenses || [];
  const income = budget?.income || [];
  const totalExpected = expenses.reduce((s, e) => s + (e.expected || 0), 0);
  const totalActual = expenses.reduce((s, e) => s + (e.actual || 0), 0);
  const totalIncomeExpected = income.reduce((s, i) => s + (i.expected || 0), 0);
  const totalIncomeActual = income.reduce((s, i) => s + (i.actual || 0), 0);
  const netBalance = totalIncomeActual - totalActual;

  const fmtINR = (n) => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            💰 Budget & Expenses
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.9rem' }}>
            Track sponsorship, expenses, and fest financials
          </p>
        </div>
        {selectedEventId && budget && (
          <button onClick={handleExportCsv} style={{
            padding: '0.65rem 1.25rem', borderRadius: 12,
            border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)',
            color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}>
            📥 Export CSV
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

      {selectedEventId && !loading && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Income', value: fmtINR(totalIncomeActual), sub: `Expected: ${fmtINR(totalIncomeExpected)}`, icon: '📈', color: '#4ade80' },
              { label: 'Total Expenses', value: fmtINR(totalActual), sub: `Budgeted: ${fmtINR(totalExpected)}`, icon: '📉', color: '#f87171' },
              { label: 'Net Balance', value: fmtINR(netBalance), sub: netBalance >= 0 ? 'Surplus' : 'Deficit', icon: netBalance >= 0 ? '✅' : '⚠️', color: netBalance >= 0 ? '#4ade80' : '#fbbf24' },
              { label: 'Expense Items', value: expenses.length, sub: `${income.length} income entries`, icon: '📊', color: '#a5b4fc' },
            ].map((s, i) => (
              <div key={i} style={{
                ...cardStyle, padding: '1.25rem', animation: `fadeInUp ${0.2 + i * 0.1}s ease-out`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                  <span style={{ color: '#475569', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
            {[
              { key: 'expenses', icon: '💸', label: `Expenses (${expenses.length})` },
              { key: 'income', icon: '💵', label: `Income (${income.length})` },
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

          {tab === 'expenses' && (
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              {/* Add Expense Form */}
              <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
                  ➕ Add Expense
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Description *</label>
                    <input style={inputStyle} value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Venue booking" />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                      {['General', 'Venue', 'Food', 'Marketing', 'Prizes', 'Equipment', 'Travel', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Expected (₹)</label>
                    <input type="number" style={inputStyle} value={expenseForm.expected} onChange={e => setExpenseForm({ ...expenseForm, expected: e.target.value })} placeholder="5000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Actual (₹)</label>
                    <input type="number" style={inputStyle} value={expenseForm.actual} onChange={e => setExpenseForm({ ...expenseForm, actual: e.target.value })} placeholder="4500" />
                  </div>
                  <div>
                    <label style={labelStyle}>Paid By</label>
                    <input style={inputStyle} value={expenseForm.paidBy} onChange={e => setExpenseForm({ ...expenseForm, paidBy: e.target.value })} placeholder="Treasurer" />
                  </div>
                </div>
                <button onClick={handleAddExpense} disabled={saving || !expenseForm.description.trim()} style={{
                  marginTop: '1rem', padding: '0.65rem 1.5rem', borderRadius: 12, border: 'none',
                  background: saving || !expenseForm.description.trim() ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, cursor: saving || !expenseForm.description.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {saving ? '⏳ Adding…' : '💸 Add Expense'}
                </button>
              </div>

              {/* Expense Table */}
              {expenses.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💸</div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No expenses recorded yet. Add your first expense above.</p>
                </div>
              ) : (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                          {['Description', 'Category', 'Expected', 'Actual', 'Paid By', ''].map((h, i) => (
                            <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((e, i) => (
                          <tr key={e._id || i} style={{ borderBottom: '1px solid rgba(51,65,85,0.25)' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{e.description}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>{e.category}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{fmtINR(e.expected)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>{fmtINR(e.actual)}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{e.paidBy || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <button onClick={() => handleDeleteExpense(e._id)} style={{
                                padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                                background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.7rem',
                              }}>🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid rgba(99,102,241,0.3)' }}>
                          <td colSpan={2} style={{ padding: '0.75rem 1rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700 }}>Total</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>{fmtINR(totalExpected)}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', fontWeight: 700 }}>{fmtINR(totalActual)}</td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'income' && (
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              {/* Add Income Form */}
              <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
                  ➕ Add Income
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Source *</label>
                    <input style={inputStyle} value={incomeForm.source} onChange={e => setIncomeForm({ ...incomeForm, source: e.target.value })} placeholder="Title Sponsor" />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <input style={inputStyle} value={incomeForm.description} onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} placeholder="Annual sponsorship deal" />
                  </div>
                  <div>
                    <label style={labelStyle}>Expected (₹)</label>
                    <input type="number" style={inputStyle} value={incomeForm.expected} onChange={e => setIncomeForm({ ...incomeForm, expected: e.target.value })} placeholder="25000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Actual (₹)</label>
                    <input type="number" style={inputStyle} value={incomeForm.actual} onChange={e => setIncomeForm({ ...incomeForm, actual: e.target.value })} placeholder="25000" />
                  </div>
                </div>
                <button onClick={handleAddIncome} disabled={saving || !incomeForm.source.trim()} style={{
                  marginTop: '1rem', padding: '0.65rem 1.5rem', borderRadius: 12, border: 'none',
                  background: saving || !incomeForm.source.trim() ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, cursor: saving || !incomeForm.source.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {saving ? '⏳ Adding…' : '💵 Add Income'}
                </button>
              </div>

              {/* Income List */}
              {income.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💵</div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No income entries yet. Add sponsorship or revenue above.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {income.map((inc, i) => (
                    <div key={inc._id || i} style={{
                      ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                        flexShrink: 0,
                      }}>💵</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{inc.source}</div>
                        {inc.description && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>{inc.description}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 700 }}>{fmtINR(inc.actual)}</div>
                        <div style={{ color: '#475569', fontSize: '0.7rem' }}>exp: {fmtINR(inc.expected)}</div>
                      </div>
                    </div>
                  ))}
                  {/* Total Row */}
                  <div style={{
                    ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', borderColor: 'rgba(34,197,94,0.3)',
                    background: 'rgba(34,197,94,0.06)',
                  }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>Total Income</span>
                    <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '1.1rem' }}>{fmtINR(totalIncomeActual)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {msg && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 10,
              background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: msg.type === 'success' ? '#4ade80' : '#f87171',
              fontSize: '0.85rem', fontWeight: 500, animation: 'fadeInUp 0.3s ease-out',
            }}>
              {msg.type === 'success' ? '✅' : '❌'} {msg.text}
            </div>
          )}
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ Loading budget...</div>
      )}

      {!selectedEventId && !loading && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
            Select an event to manage budget
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Choose an event above to track sponsorship income, vendor payouts, and financial health.
          </p>
        </div>
      )}
    </div>
  );
}
