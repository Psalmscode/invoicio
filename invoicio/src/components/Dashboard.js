import React from 'react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import { calcTotal, formatCurrency, formatDate, convertCurrency } from '../utils/helpers';
import { InvoiceIcon } from './Icons';

export default function Dashboard() {
  const { invoices, currency } = useApp();

  const paid = invoices.filter(i => i.status === 'paid');
  const pending = invoices.filter(i => i.status === 'pending');
  const drafts = invoices.filter(i => i.status === 'draft');
  
  // Convert all amounts to the selected currency
  const totalRevenue = paid.reduce((s, i) => {
    const amount = calcTotal(i.items);
    const invoiceCurrency = i.invoiceCurrency || 'GBP';
    return s + convertCurrency(amount, invoiceCurrency, currency);
  }, 0);
  
  const outstanding = pending.reduce((s, i) => {
    const amount = calcTotal(i.items);
    const invoiceCurrency = i.invoiceCurrency || 'GBP';
    return s + convertCurrency(amount, invoiceCurrency, currency);
  }, 0);

  const allInvoicesTotal = invoices.reduce((s, i) => {
    const amount = calcTotal(i.items);
    const invoiceCurrency = i.invoiceCurrency || 'GBP';
    return s + convertCurrency(amount, invoiceCurrency, currency);
  }, 0);

  const recent = [...invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="animate-in">
      {/* Stats */}
      <div className="stats-grid" role="region" aria-label="Invoice summary statistics">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(totalRevenue, currency)}</div>
          <div className="stat-sub">{paid.length} paid invoice{paid.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{formatCurrency(outstanding, currency)}</div>
          <div className="stat-sub">{pending.length} pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drafts</div>
          <div className="stat-value">{drafts.length}</div>
          <div className="stat-sub">Awaiting review</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All Invoices</div>
          <div className="stat-value">{invoices.length}</div>
          <div className="stat-sub">{formatCurrency(allInvoicesTotal, currency)} total</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-label">Recent Activity</div>

      {recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <InvoiceIcon width={32} height={32} />
          </div>
          <h2 className="empty-title">No invoices yet</h2>
          <p className="empty-sub">Head to the Invoices tab to create your first invoice.</p>
        </div>
      ) : (
        <ol className="invoice-list" aria-label="Recent invoices">
          {recent.map(inv => (
            <li key={inv.id} style={{ listStyle: 'none' }}>
              <div className="invoice-card" style={{ cursor: 'default' }}>
                <div className="invoice-id">
                  <span>#</span>{inv.id.replace('#', '')}
                </div>
                <div className="invoice-client">
                  <strong>{inv.to.name}</strong>
                  <small>{inv.desc}</small>
                </div>
                <div className="invoice-due">
                  <strong>{formatDate(inv.date)}</strong>
                  {inv.no}
                </div>
                <div className="invoice-amount">
                  {formatCurrency(convertCurrency(calcTotal(inv.items), inv.invoiceCurrency || 'GBP', currency), currency)}
                </div>
                <div className="badge-wrapper">
                  <Badge status={inv.status} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
