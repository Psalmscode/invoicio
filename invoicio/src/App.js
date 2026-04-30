import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import InvoiceForm from './components/InvoiceForm';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Branding from './components/Branding';
import ToastContainer from './components/Toast';
import { MenuIcon, PlusIcon } from './components/Icons';

export default function App() {
  const { saveInvoice, addToast, invoices } = useApp();
  const [page, setPage] = useState('invoices');
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync selected invoice when invoices update
  const selectedInvoice = selectedId
    ? invoices.find(i => i.id === selectedId) || null
    : null;

  function handleNavigate(pg) {
    setPage(pg);
    setSelectedId(null);
    setSidebarOpen(false);
  }

  function handleSelect(inv) {
    setSelectedId(inv.id);
  }

  function handleBack() {
    setSelectedId(null);
  }

  function handleNew() {
    setEditInvoice(null);
    setShowForm(true);
  }

  function handleEdit(inv) {
    setEditInvoice(inv);
    setShowForm(true);
  }

  function handleSave(data) {
    const isNew = !editInvoice;
    saveInvoice(data);
    setShowForm(false);
    setEditInvoice(null);

    if (isNew) {
      addToast(`Invoice ${data.id} created as ${data.status}.`, 'success');
    } else {
      addToast(`Invoice ${data.id} updated.`, 'success');
      setSelectedId(data.id);
    }
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditInvoice(null);
  }

  const pageTitle = {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    clients: 'Clients',
    settings: 'Branding',
  };

  const pageSubtitle = {
    dashboard: 'Overview & analytics',
    invoices: selectedInvoice ? `Invoice ${selectedInvoice.id}` : 'Manage your invoices',
    clients: 'Saved contacts & billing details',
    settings: 'Manage branding, logo & default invoice notes',
  };

  // close sidebar with Escape and lock body scroll when open (mobile overlay)
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [sidebarOpen]);

  return (
    <div className="app-layout">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <Sidebar page={page} onNavigate={handleNavigate} onClose={() => setSidebarOpen(false)} open={sidebarOpen} />
      </div>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              <MenuIcon />
            </button>
            <div className="page-title">
              {pageTitle[page]}
              <small>{pageSubtitle[page]}</small>
            </div>
          </div>

          <div className="topbar-actions">
            {page === 'invoices' && !selectedInvoice && (
              <button
                className="btn btn-primary"
                onClick={handleNew}
                aria-label="Create new invoice"
              >
                <PlusIcon /> New Invoice
              </button>
            )}
          </div>
        </header>

        <main id="main-content" className="content" aria-hidden={sidebarOpen ? 'true' : 'false'}>
          <h1 className="sr-only">{pageTitle[page]}</h1>

          {page === 'dashboard' && <Dashboard />}

          {page === 'invoices' && !selectedInvoice && (
            <InvoiceList onSelect={handleSelect} onNew={handleNew} />
          )}

          {page === 'invoices' && selectedInvoice && (
            <InvoiceDetail
              invoice={selectedInvoice}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          )}

          {page === 'clients' && <Clients />}
          {page === 'settings' && <Branding />}
        </main>
      </div>

      {/* Invoice Form Drawer */}
      {showForm && (
        <InvoiceForm
          invoice={editInvoice}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
