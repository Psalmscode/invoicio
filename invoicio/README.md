# Wondersio — Invoice Management App

A fully responsive, accessible invoice management application built with React.

## Live Demo

Deploy to Vercel or Netlify using the steps below.

---

## Setup Instructions

### Prerequisites
- Node.js 16+
- npm or yarn

### Install & Run

```bash
# Clone or unzip the project
cd invoicio

# Install dependencies
npm install

# Start development server
npm start
# → Opens at http://localhost:3000

# Build for production
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag the /build folder to netlify.com/drop
```

---

## Architecture

```
src/
├── components/
│   ├── Badge.js          # Status badge (draft / pending / paid)
│   ├── Dashboard.js      # Overview stats + recent invoices
│   ├── Icons.js          # All SVG icon components
│   ├── InvoiceDetail.js  # Full invoice detail view
│   ├── InvoiceForm.js    # Create / edit form with validation
│   ├── InvoiceList.js    # Filterable invoice list
│   ├── Modal.js          # Confirmation modal with focus trap
│   ├── Sidebar.js        # Navigation sidebar + theme toggle
│   └── Toast.js          # Notification toasts
├── context/
│   └── AppContext.js     # Global state: invoices, theme, toasts
├── hooks/
│   └── useFocusTrap.js   # Focus trap for modal/drawer accessibility
├── utils/
│   └── helpers.js        # Formatters, generators, sample data
├── App.js                # Root layout + page/state routing
├── index.css             # All global styles + CSS variables
└── index.js              # React DOM entry point
```

### State Management

All state lives in `AppContext` (React Context + useState). No external state library is needed. Data is persisted to `localStorage` on every change via a `useEffect`.

### Routing

No router library is used. Page state (`dashboard` | `invoices`) and selected invoice ID are managed with `useState` in `App.js`. This keeps the bundle minimal.

### Theming

CSS custom properties (variables) drive all colours. The `data-theme` attribute on `<html>` switches between light and dark token sets. The preference is persisted to `localStorage` and applied before first render to prevent flash.

---

## Features

| Feature | Status |
|---|---|
| Create invoice | ✅ |
| Read / list invoices | ✅ |
| Update invoice | ✅ |
| Delete invoice | ✅ |
| Save as draft | ✅ |
| Mark as paid | ✅ |
| Filter by status | ✅ |
| Form validation | ✅ |
| Light / dark mode | ✅ |
| localStorage persistence | ✅ |
| Toast notifications | ✅ |
| Responsive layout | ✅ |
| Focus trap in modal/drawer | ✅ |
| ESC key closes overlays | ✅ |
| Keyboard navigable list | ✅ |

---

## Trade-offs

- **No router**: URL does not reflect the current view. For a multi-user or shareable app a router (React Router) should be added so invoices are deep-linkable.
- **localStorage only**: Data is per-browser. A real backend (Node/Express, Supabase, etc.) would be needed for multi-device or multi-user use.
- **Single-bundle CSS**: All styles are in `index.css` for simplicity. A larger app would benefit from CSS Modules or styled-components per component.
- **No pagination**: The invoice list renders all items. For large datasets, virtual scrolling or paginated API calls would be needed.

---

## Accessibility Notes

- Semantic HTML throughout: `<nav>`, `<main>`, `<header>`, `<ol>`, `<table>`, `<button>`.
- All form fields have associated `<label>` elements.
- All interactive elements are `<button>` — no `div` click handlers.
- Modal and form drawer both implement a **focus trap** via `useFocusTrap.js`: Tab/Shift+Tab cycle is constrained inside the overlay, and focus is restored when closed.
- ESC key closes all overlays (modal, form drawer).
- `aria-modal`, `aria-label`, `aria-invalid`, `aria-live`, `aria-current`, `aria-pressed`, `aria-expanded` used throughout.
- WCAG AA colour contrast maintained in both light and dark modes.
- `role="alert"` on inline form errors for screen reader announcements.
- Invoice list uses `aria-live="polite"` on the filter count so changes are announced.
- Screen-reader-only `<h1>` on each page for landmark navigation.

---

## Possible Improvements

- **React Router** for deep-linkable invoice URLs (`/invoices/:id`)
- **Backend API** (Node/Express or Next.js API routes) with a database
- **PDF export** — generate a print-ready invoice PDF
- **Email sending** — integrate SendGrid or Resend to actually send invoices
- **Search** — full-text search across client name, description, invoice number
- **Pagination / infinite scroll** for large datasets
- **Recurring invoices** — schedule automatic invoice creation
- **Multi-currency support**
- **Unit tests** with React Testing Library
