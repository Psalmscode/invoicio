import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import Modal from './Modal';
import { formatDate, formatCurrency, calcTotal, convertCurrency } from '../utils/helpers';
import { BackIcon, EditIcon, TrashIcon, CheckIcon, LockIcon } from './Icons';

export default function InvoiceDetail({ invoice, onBack, onEdit }) {
  const { deleteInvoice, markAsPaid, addToast, currency } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const total = calcTotal(invoice.items);
  const isPaid = invoice.status === 'paid';
  const invoiceCurrency = invoice.invoiceCurrency || 'GBP';
  const showConversion = invoiceCurrency !== currency;

  function handleDelete() {
    deleteInvoice(invoice.id);
    addToast(`Invoice ${invoice.id} deleted.`, 'info');
    setShowDeleteModal(false);
    onBack();
  }

  function handleMarkPaid() {
    markAsPaid(invoice.id);
    addToast(`Invoice ${invoice.id} marked as paid!`, 'success');
  }

  return (
    <div className="animate-in">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}>
        <BackIcon /> Go Back
      </button>

      {/* Action Bar */}
      <div className="action-bar">
        <span className="action-bar-status">Status</span>
        <Badge status={invoice.status} />

        {isPaid && (
          <div className="locked-notice" aria-label="This invoice is paid and locked for editing">
            <LockIcon /> Invoice is paid and locked
          </div>
        )}

        <div className="action-bar-right">
          {!isPaid && (
            <button
              className="btn btn-ghost"
              onClick={() => onEdit(invoice)}
              aria-label={`Edit invoice ${invoice.id}`}
            >
              <EditIcon /> Edit
            </button>
          )}
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
            aria-label={`Delete invoice ${invoice.id}`}
          >
            <TrashIcon /> Delete
          </button>
          {invoice.status === 'pending' && (
            <button
              className="btn btn-success"
              onClick={handleMarkPaid}
              aria-label={`Mark invoice ${invoice.id} as paid`}
            >
              <CheckIcon /> Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <div className="detail-id">
              <span>#</span>{invoice.id.replace('#', '')}
            </div>
            <div className="detail-desc">{invoice.desc}</div>
          </div>
          <div className="detail-from">
            {invoice.from.street && <div>{invoice.from.street}</div>}
            {invoice.from.city && <div>{invoice.from.city} {invoice.from.postcode}</div>}
            {invoice.from.country && <div>{invoice.from.country}</div>}
            {invoice.from.name && <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--text)' }}>{invoice.from.name}</div>}
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <p className="detail-section">Invoice Date</p>
            <p className="detail-value">{formatDate(invoice.date)}</p>
            <p className="detail-section" style={{ marginTop: 20 }}>Payment Due</p>
            <p className="detail-value">{formatDate(invoice.due)}</p>
            <p className="detail-section" style={{ marginTop: 20 }}>Payment Terms</p>
            <p className="detail-value">Net {invoice.paymentTerms} {invoice.paymentTerms === 1 ? 'Day' : 'Days'}</p>
          </div>

          <div>
            <p className="detail-section">Bill To</p>
            <p className="detail-value">{invoice.to.name}</p>
            <div className="detail-address">
              {invoice.to.street && <div>{invoice.to.street}</div>}
              {invoice.to.city && <div>{invoice.to.city} {invoice.to.postcode}</div>}
              {invoice.to.country && <div>{invoice.to.country}</div>}
            </div>
          </div>

          <div>
            <p className="detail-section">Sent To</p>
            <p className="detail-value" style={{ wordBreak: 'break-all' }}>
              {invoice.to.email}
            </p>
            <p className="detail-section" style={{ marginTop: 20 }}>Invoice No.</p>
            <p className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{invoice.no}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-wrapper">
          <table className="items-table" aria-label="Invoice line items">
            <thead>
              <tr>
                <th scope="col">Item Name</th>
                <th scope="col">QTY.</th>
                <th scope="col">Unit Price</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id || i}>
                  <td className="td-name">{item.name}</td>
                  <td className="td-qty">{item.qty}</td>
                  <td className="td-price">
                    {formatCurrency(item.price, invoiceCurrency)}
                    {showConversion && (
                      <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                        = {formatCurrency(convertCurrency(item.price, invoiceCurrency, currency), currency)}
                      </div>
                    )}
                  </td>
                  <td className="td-total">
                    {formatCurrency((+item.qty) * (+item.price), invoiceCurrency)}
                    {showConversion && (
                      <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                        = {formatCurrency(convertCurrency((+item.qty) * (+item.price), invoiceCurrency, currency), currency)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total-row">
            <span className="total-label">Grand Total</span>
            <span className="total-amount">
              {formatCurrency(total, invoiceCurrency)}
              {showConversion && (
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '6px', fontWeight: 'normal' }}>
                  ≈ {formatCurrency(convertCurrency(total, invoiceCurrency, currency), currency)}
                </div>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Confirm Deletion"
          text={
            <>
              Are you sure you want to delete invoice{' '}
              <strong>{invoice.id}</strong>? This action cannot be undone.
            </>
          }
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete Invoice"
          confirmClass="btn-danger"
        />
      )}
    </div>
  );
}
