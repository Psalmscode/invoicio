import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useApp } from '../context/AppContext';
import { CURRENCY_OPTIONS } from '../utils/helpers';
import { InvoiceIcon, ChartIcon, SunIcon, MoonIcon, XIcon } from './Icons';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: ChartIcon },
  { id: 'invoices', label: 'Invoices', Icon: InvoiceIcon },
];

export default function Sidebar({ page, onNavigate, onClose, open }) {
  const { theme, toggleTheme, currency, changeCurrency } = useApp();
  const trapRef = useFocusTrap(!!open);

  return (
    <nav id="sidebar" aria-label="Main navigation" ref={trapRef}>
      <div className="sidebar-logo" aria-label="Wondersio">
        <span>Wondersio<span>.</span></span>
        <button
          className="menu-btn visible-on-mobile"
          onClick={() => onClose && onClose()}
          aria-label="Close navigation"
        >
          <XIcon />
        </button>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            aria-current={page === id ? 'page' : undefined}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="currency-selector">
          <label htmlFor="currency-select" className="currency-label">Currency</label>
          <select
            id="currency-select"
            className="currency-select"
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
            aria-label="Select currency"
          >
            {CURRENCY_OPTIONS.map(({ code, name }) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </nav>
  );
}
