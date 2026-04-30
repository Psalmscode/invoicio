import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_DATA, CURRENCY_OPTIONS } from '../utils/helpers';

const STORAGE_KEY = 'invoicio_v1';
const THEME_KEY = 'invoicio_theme';
const CURRENCY_KEY = 'wondersio_currency';

function loadData() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : SAMPLE_DATA;
  } catch {
    return SAMPLE_DATA;
  }
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function loadCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'GBP';
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [invoices, setInvoices] = useState(loadData);
  const [theme, setTheme] = useState(loadTheme);
  const [currency, setCurrency] = useState(loadCurrency);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const changeCurrency = useCallback((newCurrency) => {
    if (CURRENCY_OPTIONS.find(c => c.code === newCurrency)) {
      setCurrency(newCurrency);
    }
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveInvoice = useCallback((data) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === data.id);
      if (idx >= 0) {
        const n = [...prev];
        n[idx] = data;
        return n;
      }
      return [data, ...prev];
    });
  }, []);

  const deleteInvoice = useCallback((id) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const markAsPaid = useCallback((id) => {
    setInvoices(prev =>
      prev.map(i => (i.id === id ? { ...i, status: 'paid' } : i))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        invoices,
        theme,
        currency,
        toasts,
        toggleTheme,
        changeCurrency,
        addToast,
        removeToast,
        saveInvoice,
        deleteInvoice,
        markAsPaid,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
