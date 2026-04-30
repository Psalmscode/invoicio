import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_DATA, CURRENCY_OPTIONS } from '../utils/helpers';

const STORAGE_KEY = 'invoicio_v1';
const THEME_KEY = 'invoicio_theme';
const CURRENCY_KEY = 'wondersio_currency';
const CLIENTS_KEY = 'invoicio_clients';
const BRANDING_KEY = 'invoicio_branding';

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

function loadClients() {
  try {
    const d = localStorage.getItem(CLIENTS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

function loadBranding() {
  try {
    const d = localStorage.getItem(BRANDING_KEY);
    return d ? JSON.parse(d) : { logo: '', notes: '' };
  } catch {
    return { logo: '', notes: '' };
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [invoices, setInvoices] = useState(loadData);
  const [theme, setTheme] = useState(loadTheme);
  const [currency, setCurrency] = useState(loadCurrency);
  const [clients, setClients] = useState(loadClients);
  const [branding, setBranding] = useState(loadBranding);
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

  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
    } catch {}
  }, [branding]);

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

  const addClient = useCallback((client) => {
    setClients(prev => {
      const idx = prev.findIndex(c => c.id === client.id);
      if (idx >= 0) {
        const n = [...prev];
        n[idx] = client;
        return n;
      }
      return [client, ...prev];
    });
  }, []);

  const removeClient = useCallback((id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateBranding = useCallback((data) => {
    setBranding(prev => ({ ...prev, ...data }));
  }, []);

  const removeBranding = useCallback(() => {
    setBranding({ logo: '', notes: '' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        invoices,
        theme,
        currency,
        clients,
        branding,
        toasts,
        toggleTheme,
        changeCurrency,
        addToast,
        removeToast,
        saveInvoice,
        deleteInvoice,
        markAsPaid,
        addClient,
        removeClient,
        updateBranding,
        removeBranding,
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
