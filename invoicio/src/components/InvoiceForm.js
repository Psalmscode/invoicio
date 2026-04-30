import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { genId, genInvoiceNo, addDays, today, calcTotal, formatCurrency } from '../utils/helpers';
import { XIcon } from './Icons';

const EMPTY_FORM = (currentCurrency = 'GBP') => ({
  no: genInvoiceNo(),
  date: today(),
  paymentTerms: 30,
  desc: '',
  invoiceCurrency: currentCurrency,
  from: { name: '', street: '', city: '', postcode: '', country: '' },
  to: { name: '', email: '', street: '', city: '', postcode: '', country: '' },
  items: [{ id: Date.now(), name: '', qty: 1, price: '' }],
});

function validate(form) {
  const errors = {};
  if (!form.from.name.trim()) errors['from.name'] = 'Required';
  if (!form.to.name.trim()) errors['to.name'] = 'Client name is required';
  if (!form.to.email.trim()) {
    errors['to.email'] = 'Client email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.to.email)) {
    errors['to.email'] = 'Please enter a valid email address';
  }
  if (!form.desc.trim()) errors['desc'] = 'Description is required';
  if (!form.date) errors['date'] = 'Invoice date is required';
  if (!form.items.length) {
    errors['items'] = 'At least one item is required';
  }
  form.items.forEach((item, i) => {
    if (!item.name.trim()) errors[`item_${i}_name`] = 'Required';
    if (+item.qty <= 0 || isNaN(+item.qty)) errors[`item_${i}_qty`] = 'Must be > 0';
    if (+item.price <= 0 || isNaN(+item.price)) errors[`item_${i}_price`] = 'Must be > 0';
  });
  return errors;
}

export default function InvoiceForm({ invoice, onSave, onClose }) {
  const { currency, saveInvoice, addToast } = useApp();
  const isEdit = !!invoice;
  const [form, setForm] = useState(() =>
    isEdit ? { ...invoice, items: invoice.items.map(i => ({ ...i })) } : EMPTY_FORM(currency)
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function setField(path, val) {
    setForm(f => {
      const next = { ...f };
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = val;
      return next;
    });
    if (submitted) setErrors(e => ({ ...e, [path]: '' }));
  }

  function setItem(idx, field, val) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val };
      return { ...f, items };
    });
    if (submitted) setErrors(e => ({ ...e, [`item_${idx}_${field}`]: '' }));
  }

  function addItem() {
    setForm(f => ({
      ...f,
      items: [...f.items, { id: Date.now(), name: '', qty: 1, price: '' }],
    }));
  }

  function removeItem(idx) {
    if (form.items.length === 1) return;
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function buildInvoice(status) {
    const due = addDays(form.date || today(), +form.paymentTerms);
    return {
      ...form,
      id: isEdit ? invoice.id : genId(),
      status,
      due,
      items: form.items.map(it => ({
        ...it,
        qty: +it.qty,
        price: +it.price,
      })),
    };
  }

  function handleSave(targetStatus) {
    if (targetStatus !== 'draft') {
      setSubmitted(true);
      const errs = validate(form);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    let finalStatus = targetStatus;
    if (isEdit) {
      // Keep existing status unless it was draft being promoted
      finalStatus = targetStatus === 'draft' ? 'draft'
        : invoice.status === 'draft' ? 'pending'
        : invoice.status;
    }

    onSave(buildInvoice(finalStatus));
  }

  const total = calcTotal(form.items);
  const errorCount = Object.keys(errors).length;

  return (
    <div className="form-overlay">
      <div
        className="form-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="form-panel"
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? `Edit invoice ${invoice.id}` : 'Create new invoice'}
      >
        <h2 className="form-title">
          {isEdit ? <>Edit <span>{invoice.id}</span></> : 'New Invoice'}
        </h2>

        {submitted && errorCount > 0 && (
          <div className="form-errors-summary" role="alert">
            Please fix {errorCount} error{errorCount !== 1 ? 's' : ''} before continuing.
          </div>
        )}

        {/* Bill From */}
        <div className="form-section">
          <div className="form-section-title">Bill From</div>
          <div className="form-row full">
            <Field
              id="from-name" label="Your Name *"
              value={form.from.name} onChange={v => setField('from.name', v)}
              error={errors['from.name']} placeholder="Your full name"
            />
          </div>
          <div className="form-row full">
            <Field
              id="from-street" label="Street Address"
              value={form.from.street} onChange={v => setField('from.street', v)}
              placeholder="Street address"
            />
          </div>
          <div className="form-row triple">
            <Field id="from-city" label="City" value={form.from.city} onChange={v => setField('from.city', v)} placeholder="City" />
            <Field id="from-post" label="Post Code" value={form.from.postcode} onChange={v => setField('from.postcode', v)} placeholder="Postcode" />
            <Field id="from-country" label="Country" value={form.from.country} onChange={v => setField('from.country', v)} placeholder="Country" />
          </div>
        </div>

        {/* Bill To */}
        <div className="form-section">
          <div className="form-section-title">Bill To</div>
          <div className="form-row full">
            <Field
              id="to-name" label="Client Name *"
              value={form.to.name} onChange={v => setField('to.name', v)}
              error={errors['to.name']} placeholder="Client's full name"
            />
          </div>
          <div className="form-row full">
            <Field
              id="to-email" label="Client Email *" type="email"
              value={form.to.email} onChange={v => setField('to.email', v)}
              error={errors['to.email']} placeholder="client@example.com"
            />
          </div>
          <div className="form-row full">
            <Field id="to-street" label="Street Address" value={form.to.street} onChange={v => setField('to.street', v)} placeholder="Street address" />
          </div>
          <div className="form-row triple">
            <Field id="to-city" label="City" value={form.to.city} onChange={v => setField('to.city', v)} placeholder="City" />
            <Field id="to-post" label="Post Code" value={form.to.postcode} onChange={v => setField('to.postcode', v)} placeholder="Postcode" />
            <Field id="to-country" label="Country" value={form.to.country} onChange={v => setField('to.country', v)} placeholder="Country" />
          </div>
        </div>

        {/* Invoice Details */}
        <div className="form-section">
          <div className="form-section-title">Invoice Details</div>
          <div className="form-row">
            <Field
              id="inv-date" label="Invoice Date *" type="date"
              value={form.date} onChange={v => setField('date', v)}
              error={errors['date']}
            />
            <div className="form-field">
              <label htmlFor="inv-terms">Payment Terms</label>
              <select
                id="inv-terms"
                value={form.paymentTerms}
                onChange={e => setField('paymentTerms', +e.target.value)}
              >
                <option value={1}>Net 1 Day</option>
                <option value={7}>Net 7 Days</option>
                <option value={14}>Net 14 Days</option>
                <option value={30}>Net 30 Days</option>
              </select>
            </div>
          </div>
          <div className="form-row full">
            <Field
              id="inv-desc" label="Description *"
              value={form.desc} onChange={v => setField('desc', v)}
              error={errors['desc']} placeholder="e.g. Graphic Design Services"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="form-section">
          <div className="form-section-title">Line Items</div>
          <div className="items-form-header">
            <span>Item Name</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
            <span />
          </div>

          {form.items.map((item, i) => (
            <div key={item.id} className="item-row">
              <div>
                <input
                  value={item.name}
                  onChange={e => setItem(i, 'name', e.target.value)}
                  className={errors[`item_${i}_name`] ? 'has-error' : ''}
                  placeholder="Item description"
                  aria-label={`Item ${i + 1} name`}
                  aria-invalid={!!errors[`item_${i}_name`]}
                />
                {errors[`item_${i}_name`] && (
                  <span className="form-error" style={{ fontSize: 10 }}>{errors[`item_${i}_name`]}</span>
                )}
              </div>
              <div>
                <input
                  type="number" min="0" step="1"
                  value={item.qty}
                  onChange={e => setItem(i, 'qty', e.target.value)}
                  className={errors[`item_${i}_qty`] ? 'has-error' : ''}
                  aria-label={`Item ${i + 1} quantity`}
                  aria-invalid={!!errors[`item_${i}_qty`]}
                />
                {errors[`item_${i}_qty`] && (
                  <span className="form-error" style={{ fontSize: 10 }}>{errors[`item_${i}_qty`]}</span>
                )}
              </div>
              <div>
                <input
                  type="number" min="0" step="0.01"
                  value={item.price}
                  onChange={e => setItem(i, 'price', e.target.value)}
                  className={errors[`item_${i}_price`] ? 'has-error' : ''}
                  aria-label={`Item ${i + 1} unit price`}
                  aria-invalid={!!errors[`item_${i}_price`]}
                />
                {errors[`item_${i}_price`] && (
                  <span className="form-error" style={{ fontSize: 10 }}>{errors[`item_${i}_price`]}</span>
                )}
              </div>
              <div className="item-total">
                {formatCurrency((+item.qty || 0) * (+item.price || 0), currency)}
              </div>
              <button
                type="button"
                className="del-btn"
                onClick={() => removeItem(i)}
                aria-label={`Remove item ${i + 1}: ${item.name || 'unnamed'}`}
                title="Remove item"
                disabled={form.items.length === 1}
              >
                <XIcon />
              </button>
            </div>
          ))}

          <button type="button" className="add-item-btn" onClick={addItem}>
            + Add New Item
          </button>

          <div className="items-total">
            Invoice Total: <strong>{formatCurrency(total, currency)}</strong>
          </div>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Discard
          </button>
          <div className="form-footer-right">
            {!isEdit && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleSave('draft')}
              >
                Save Draft
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave(isEdit ? (invoice.status === 'draft' ? 'pending' : invoice.status) : 'pending')}
            >
              {isEdit ? 'Save Changes' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, error, placeholder, type = 'text' }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? 'has-error' : ''}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span className="form-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
