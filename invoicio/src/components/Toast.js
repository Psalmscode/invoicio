import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckIcon, AlertIcon, XIcon } from './Icons';

function Toast({ toast }) {
  const { removeToast } = useApp();
  const icons = {
    success: <CheckIcon />,
    error: <AlertIcon />,
    info: <AlertIcon />,
  };

  return (
    <div
      className={`toast toast-${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          padding: '0 0 0 8px',
          display: 'flex',
          opacity: 0.7,
        }}
        aria-label="Dismiss notification"
      >
        <XIcon width={12} height={12} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
