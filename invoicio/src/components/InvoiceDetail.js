import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Badge from './Badge';
import Modal from './Modal';
import { formatDate, formatCurrency, calcTotal, convertCurrency } from '../utils/helpers';
import { BackIcon, EditIcon, TrashIcon, CheckIcon, LockIcon, InvoiceIcon } from './Icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoiceDetail({ invoice, onBack, onEdit }) {
  const { deleteInvoice, markAsPaid, addToast, currency, saveInvoice, branding } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const printRef = useRef(null);

  const total = calcTotal(invoice.items);
  const taxRate = +invoice.taxRate || 0;
  const taxAmount = +(total * (taxRate / 100));
  const grandTotal = total + taxAmount;
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

  async function handleDownloadPdf() {
    try {
      const el = printRef.current;
      if (!el) throw new Error('Invoice element not found');

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        const scale = pageHeight / pdfHeight;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth * scale, pdfHeight * scale);
      }

      const filename = `${invoice.no || invoice.id}.pdf`;
      pdf.save(filename);
      addToast(`Downloaded ${filename}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate PDF', 'error');
    }
  }

  async function handlePrepareEmail() {
    try {
      await handleDownloadPdf();

      // mark invoice as sent (timestamp) and set status to pending if it was draft
      const updated = {
        ...invoice,
        sentAt: new Date().toISOString(),
        status: invoice.status === 'draft' ? 'pending' : invoice.status,
      };
      saveInvoice(updated);
      addToast(`Prepared email for ${invoice.id}`, 'info');

      const subject = `Invoice ${invoice.no || invoice.id}`;
      const body = `Hi ${invoice.to?.name || ''},\n\nPlease find attached invoice ${invoice.no || invoice.id}.\n\nThanks.`;
      window.location.href = `mailto:${invoice.to?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (err) {
      console.error(err);
      addToast('Failed to prepare email', 'error');
    }
  }

  function handleRecordPayment() {
    const input = window.prompt('Enter payment amount');
    if (!input) return;
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      addToast('Invalid payment amount', 'error');
      return;
    }
    const existing = invoice.payments ? [...invoice.payments] : [];
    existing.push({ id: Date.now(), amount, date: new Date().toISOString() });
    const paidTotal = existing.reduce((s, p) => s + (+p.amount || 0), 0);
    const newStatus = paidTotal >= calcTotal(invoice.items) ? 'paid' : 'pending';
    const updated = { ...invoice, payments: existing, status: newStatus };
    saveInvoice(updated);
    addToast(`Recorded payment of ${formatCurrency(amount, invoiceCurrency)}`, 'success');
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
          <button className="btn btn-ghost" onClick={handleDownloadPdf} aria-label={`Download invoice ${invoice.id} as PDF`}>
            <InvoiceIcon /> Export
          </button>
          <button className="btn btn-ghost" onClick={handlePrepareEmail} aria-label={`Email invoice ${invoice.id}`}>
            Email
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()} aria-label={`Print invoice ${invoice.id}`}>
            Print
          </button>
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
            <>
              <button
                className="btn btn-success"
                onClick={handleMarkPaid}
                aria-label={`Mark invoice ${invoice.id} as paid`}
              >
                <CheckIcon /> Mark as Paid
              </button>
              <button className="btn btn-ghost" onClick={handleRecordPayment} aria-label={`Record payment for ${invoice.id}`}>
                Record Payment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="detail-card" ref={printRef}>
        <div className="detail-header">
            <div>
              {branding?.logo && (
                <div style={{ marginBottom: 8 }}>
                  <img src={branding.logo} alt="Logo" style={{ maxHeight: 64, objectFit: 'contain' }} />
                </div>
              )}
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
            {invoice.bank && (invoice.bank.name || invoice.bank.account || invoice.bank.sortCode || invoice.bank.iban) && (
              <div className="detail-bank" style={{ marginTop: 8, textAlign: 'right' }}>
                <div className="detail-section" style={{ marginBottom: 6 }}>Bank Details</div>
                <div className="detail-address" style={{ textAlign: 'right' }}>
                  {invoice.bank.name && <div>{invoice.bank.name}</div>}
                  {invoice.bank.account && <div>Account: {invoice.bank.account}</div>}
                  {invoice.bank.sortCode && <div>Sort Code: {invoice.bank.sortCode}</div>}
                  {invoice.bank.iban && <div>IBAN: {invoice.bank.iban}</div>}
                </div>
              </div>
            )}
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
          <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text2)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(total, invoiceCurrency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text2)' }}>Tax ({taxRate}%)</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(taxAmount, invoiceCurrency)}</span>
            </div>
          </div>
          <div className="total-row">
            <span className="total-label">Grand Total</span>
            <span className="total-amount">
              {formatCurrency(grandTotal, invoiceCurrency)}
              {showConversion && (
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '6px', fontWeight: 'normal' }}>
                  ≈ {formatCurrency(convertCurrency(grandTotal, invoiceCurrency, currency), currency)}
                </div>
              )}
            </span>
          </div>
        </div>

        {/* Notes (if any) */}
        {invoice.notes && (
          <div className="detail-notes" style={{ marginTop: 18 }}>
            <p className="detail-section">Notes</p>
            <p className="detail-address" style={{ whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
          </div>
        )}
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
