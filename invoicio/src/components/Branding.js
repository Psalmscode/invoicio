import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Branding() {
  const { branding = { logo: '', notes: '' }, updateBranding, removeBranding, addToast } = useApp();
  const [logo, setLogo] = useState(branding.logo || '');
  const [notes, setNotes] = useState(branding.notes || '');

  useEffect(() => {
    setLogo(branding.logo || '');
    setNotes(branding.notes || '');
  }, [branding]);

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    updateBranding({ logo, notes });
    addToast && addToast('Branding saved', 'success');
  }

  function handleRemoveLogo() {
    setLogo('');
    updateBranding({ logo: '' });
    addToast && addToast('Logo removed', 'info');
  }

  function handleReset() {
    setLogo(branding.logo || '');
    setNotes(branding.notes || '');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="section-label">Branding</div>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-field">
            <label>Logo</label>
            {logo ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={logo} alt="Logo" style={{ height: 72, objectFit: 'contain', background: 'var(--surface2)', padding: 8, borderRadius: 8 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="file" accept="image/*" onChange={onFileChange} />
                  <div>
                    <button className="btn btn-ghost" onClick={handleRemoveLogo}>Remove Logo</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Default Invoice Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} placeholder="Default notes or terms to include on new invoices" />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
