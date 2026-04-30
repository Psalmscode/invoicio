import React, { useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function Modal({
  title,
  text,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmClass = 'btn-danger',
}) {
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal" ref={trapRef}>
        <h2 className="modal-title" id="modal-title">{title}</h2>
        <p className="modal-text" id="modal-desc">{text}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
