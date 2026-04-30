import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import { calcTotal, formatCurrency, formatDate, convertCurrency } from '../utils/helpers';
import { FilterIcon, PlusIcon } from './Icons';

const FILTERS = ['all', 'draft', 'pending', 'paid'];

export default function InvoiceList({ onSelect, onNew }) {
  const { invoices, currency } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(i => i.status === filter);
  }, [invoices, filter]);

  return (
    <div className="animate-in">
      {/* Filter Bar */}
      <div
        className="filter-bar"
        role="group"
        aria-label="Filter invoices by status"
      >
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="filter-count" aria-live="polite" aria-atomic="true">
          {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <FilterIcon width={32} height={32} />
          </div>
          <h2 className="empty-title">No invoices found</h2>
          <p className="empty-sub">
            {filter === 'all'
              ? 'Create your first invoice to get started.'
              : `No ${filter} invoices yet. Change the filter to see others.`}
          </p>
          {filter === 'all' && (
            <button className="btn btn-primary" onClick={onNew} style={{ marginTop: 8 }}>
              <PlusIcon /> New Invoice
            </button>
          )}
        </div>
      ) : (
        <ol className="invoice-list" aria-label="Invoice list">
          {filtered.map(inv => (
            <li key={inv.id} style={{ listStyle: 'none' }}>
              <button
                className="invoice-card"
                onClick={() => onSelect(inv)}
                aria-label={`Invoice ${inv.id} for ${inv.to.name}, ${formatCurrency(convertCurrency(calcTotal(inv.items), inv.invoiceCurrency || 'GBP', currency), currency)}, status: ${inv.status}`}
                style={{ width: '100%', textAlign: 'left', appearance: 'none', fontFamily: 'inherit' }}
              >
                <div className="invoice-id">
                  <span>#</span>{inv.id.replace('#', '')}
                </div>
                <div className="invoice-client">
                  <strong>{inv.to.name}</strong>
                  <small>{inv.desc}</small>
                </div>
                <div className="invoice-due">
                  <strong>Due {formatDate(inv.due)}</strong>
                  {inv.no}
                </div>
                <div className="invoice-amount">
                  {formatCurrency(convertCurrency(calcTotal(inv.items), inv.invoiceCurrency || 'GBP', currency), currency)}
                </div>
                <div className="badge-wrapper" aria-hidden="true">
                  <Badge status={inv.status} />
                </div>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
