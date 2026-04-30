export function genId() {
  return '#' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

export function genInvoiceNo() {
  return 'INV-' + String(Math.floor(Math.random() * 9000) + 1000);
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
];

// Exchange rates relative to USD (1 USD = X currency)
export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  MXN: 17.05,
  NGN: 1546.50,
};

export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = amount / (EXCHANGE_RATES[fromCurrency] || 1);
  return amountInUSD * (EXCHANGE_RATES[toCurrency] || 1);
}

export function formatCurrency(n, currencyCode = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(n || 0);
}

export function calcTotal(items) {
  return (items || []).reduce((s, i) => s + (+i.qty || 0) * (+i.price || 0), 0);
}

export function addDays(dateStr, n) {
  const dt = new Date(dateStr);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export const SAMPLE_DATA = [
  {
    id: '#RT3080',
    no: 'INV-0012',
    status: 'paid',
    date: '2024-08-18',
    due: '2024-09-18',
    paymentTerms: 30,
    desc: 'Graphic Design',
    invoiceCurrency: 'GBP',
    from: {
      name: 'Jensen Huang',
      street: '19 Union Terrace',
      city: 'London',
      postcode: 'E1 3EZ',
      country: 'United Kingdom',
    },
    to: {
      name: 'Alex Grim',
      street: '84 Church Way',
      city: 'Bradford',
      postcode: 'BD1 9PB',
      country: 'United Kingdom',
      email: 'alex.grim@mail.co',
    },
    items: [
      { id: 1, name: 'Banner Design', qty: 1, price: 156.0 },
      { id: 2, name: 'Email Design', qty: 2, price: 200.0 },
    ],
  },
  {
    id: '#XM9141',
    no: 'INV-0013',
    status: 'pending',
    date: '2024-08-21',
    due: '2024-09-20',
    paymentTerms: 30,
    desc: 'Web App Development',
    invoiceCurrency: 'GBP',
    from: {
      name: 'Jensen Huang',
      street: '19 Union Terrace',
      city: 'London',
      postcode: 'E1 3EZ',
      country: 'United Kingdom',
    },
    to: {
      name: 'Alysa Werner',
      street: '63 Warwick Road',
      city: 'Carlisle',
      postcode: 'CA20 2TG',
      country: 'United Kingdom',
      email: 'alysa@mail.com',
    },
    items: [
      { id: 1, name: 'UI Design', qty: 1, price: 1800.9 },
      { id: 2, name: 'Frontend Development', qty: 1, price: 2500.0 },
    ],
  },
  {
    id: '#RG0314',
    no: 'INV-0014',
    status: 'draft',
    date: '2024-09-12',
    due: '2024-09-26',
    paymentTerms: 14,
    desc: 'Logo Redesign',
    invoiceCurrency: 'GBP',
    from: {
      name: 'Jensen Huang',
      street: '19 Union Terrace',
      city: 'London',
      postcode: 'E1 3EZ',
      country: 'United Kingdom',
    },
    to: {
      name: 'Mellisa Clarke',
      street: '46 Ambrose Ave',
      city: 'Belfast',
      postcode: 'BT1 9NF',
      country: 'United Kingdom',
      email: 'mellisa.c@mail.com',
    },
    items: [{ id: 1, name: 'Logo Design', qty: 1, price: 102.04 }],
  },
  {
    id: '#TY9141',
    no: 'INV-0015',
    status: 'pending',
    date: '2024-09-01',
    due: '2024-10-01',
    paymentTerms: 30,
    desc: 'Social Media Package',
    invoiceCurrency: 'GBP',
    from: {
      name: 'Jensen Huang',
      street: '19 Union Terrace',
      city: 'London',
      postcode: 'E1 3EZ',
      country: 'United Kingdom',
    },
    to: {
      name: 'Thomas Wayne',
      street: "3 St. James Ave",
      city: 'Edinburgh',
      postcode: 'EH6 5LY',
      country: 'United Kingdom',
      email: 't.wayne@darknight.com',
    },
    items: [{ id: 1, name: 'Monthly Social Package', qty: 3, price: 675.5 }],
  },
];
