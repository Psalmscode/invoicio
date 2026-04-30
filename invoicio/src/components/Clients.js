import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { genId } from '../utils/helpers';

export default function Clients() {
  const { clients = [], addClient, removeClient } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', street: '', city: '', postcode: '', country: '' });

  function startNew() {
    setForm({ name: '', email: '', street: '', city: '', postcode: '', country: '' });
    setEditingId('new');
  }

  function startEdit(c) {
    setForm({ ...c });
    setEditingId(c.id);
  }

  function cancel() {
    setEditingId(null);
    setForm({ name: '', email: '', street: '', city: '', postcode: '', country: '' });
  }

  function save() {
    if (!form.name || !form.email) return;
    const id = editingId === 'new' ? genId() : editingId;
    addClient({ ...form, id });
    cancel();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this client?')) return;
    removeClient(id);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="section-label">Clients</div>
        <div>
          <button className="btn btn-ghost" onClick={startNew}>New Client</button>
        </div>
      </div>

      {editingId && (
        <div className="form-section" style={{ marginBottom: 18 }}>
          <div className="form-row full">
            <div className="form-field">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="form-row full">
            <div className="form-field">
              <label>Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-row full">
            <div className="form-field">
              <label>Street</label>
              <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            </div>
          </div>
          <div className="form-row triple">
            <div className="form-field">
              <label>City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Post Code</label>
              <input value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Country</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={save}>Save</button>
          </div>
        </div>
      )}

      <div className="invoice-list">
        {clients.map(c => (
          <div key={c.id} className="invoice-card" style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ color: 'var(--text2)', marginTop: 6 }}>{c.email}</div>
              <div style={{ color: 'var(--text2)', marginTop: 6 }}>
                {c.street && <div>{c.street}</div>}
                {(c.city || c.postcode) && <div>{c.city} {c.postcode}</div>}
                {c.country && <div>{c.country}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-ghost" onClick={() => startEdit(c)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="empty-state">
            <div className="empty-title">No clients yet</div>
            <div className="empty-sub">Save clients to reuse billing details when creating invoices.</div>
          </div>
        )}
      </div>
    </div>
  );
}
