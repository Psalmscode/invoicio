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

  // Aging buckets for outstanding invoices (pending)
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const todayDate = new Date();
  function daysUntilDue(dueStr) {
    if (!dueStr) return Infinity;
    const due = new Date(dueStr);
    return Math.ceil((due - todayDate) / MS_PER_DAY);
  }

  const aging = {
    overdue: { count: 0, total: 0 },
    d0_30: { count: 0, total: 0 },
    d31_60: { count: 0, total: 0 },
    d61_plus: { count: 0, total: 0 },
  };

  pending.forEach(inv => {
    const amountBase = calcTotal(inv.items) * (1 + ((inv.taxRate || 0) / 100));
    const invCurrency = inv.invoiceCurrency || 'GBP';
    const amount = convertCurrency(amountBase, invCurrency, currency);
    const days = daysUntilDue(inv.due);
    if (days < 0) {
      aging.overdue.count += 1;
      aging.overdue.total += amount;
    } else if (days <= 30) {
      aging.d0_30.count += 1;
      aging.d0_30.total += amount;
    } else if (days <= 60) {
      aging.d31_60.count += 1;
      aging.d31_60.total += amount;
    } else {
      aging.d61_plus.count += 1;
      aging.d61_plus.total += amount;
    }
  });

  function exportCsv() {
    const rows = [
      ['ID','Invoice No','Client','Email','Date','Due','Status','Currency','Amount','Amount('+currency+')','Payments','Balance']
    ];

    invoices.forEach(inv => {
      const amountBase = calcTotal(inv.items) * (1 + ((inv.taxRate || 0) / 100));
      const invCurrency = inv.invoiceCurrency || 'GBP';
      const amountConverted = convertCurrency(amountBase, invCurrency, currency);
      const paymentsSum = (inv.payments || []).reduce((s, p) => s + (+p.amount || 0), 0);
      const balanceBase = Math.max(0, amountBase - paymentsSum);
      const balanceConverted = convertCurrency(balanceBase, invCurrency, currency);
      rows.push([
        inv.id,
        inv.no || '',
        inv.to?.name || '',
        inv.to?.email || '',
        inv.date || '',
        inv.due || '',
        inv.status || '',
        invCurrency,
        (amountBase || 0).toFixed(2),
        (amountConverted || 0).toFixed(2),
        (paymentsSum || 0).toFixed(2),
        (balanceConverted || 0).toFixed(2),
      ]);
    });

    const escapeCell = (cell) => {
      const s = String(cell == null ? '' : cell).replace(/"/g, '""');
      return (s.includes(',') || s.includes('\n') || s.includes('"')) ? `"${s}"` : s;
    };

    const csv = rows.map(r => r.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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

      {/* Aging breakdown + export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <div style={{ fontSize: 14, color: '#666' }}>Aging (outstanding invoices)</div>
        <div>
          <button className="btn" onClick={exportCsv} style={{ marginLeft: 8 }}>Export Invoices (CSV)</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 12 }}>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{formatCurrency(aging.overdue.total, currency)}</div>
          <div className="stat-sub">{aging.overdue.count} invoice{aging.overdue.count !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Due in 0–30 days</div>
          <div className="stat-value">{formatCurrency(aging.d0_30.total, currency)}</div>
          <div className="stat-sub">{aging.d0_30.count} invoice{aging.d0_30.count !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Due in 31–60 days</div>
          <div className="stat-value">{formatCurrency(aging.d31_60.total, currency)}</div>
          <div className="stat-sub">{aging.d31_60.count} invoice{aging.d31_60.count !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Due in 61+ days</div>
          <div className="stat-value">{formatCurrency(aging.d61_plus.total, currency)}</div>
          <div className="stat-sub">{aging.d61_plus.count} invoice{aging.d61_plus.count !== 1 ? 's' : ''}</div>
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
