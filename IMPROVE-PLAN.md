# Frontend SaaS Polish — Veepag Tech Test

## Context
The backend is fully implemented and the core pages (Checkout, My Subscriptions) exist. This plan adds the missing pages from the spec and elevates the UI to feel like a real SaaS product with animations, polish, and a complete navigation structure — designed to impress in a technical test.

---

## Pages: What Exists vs. What to Build

| Page | Route | Status |
|------|-------|--------|
| Checkout | `/checkout/:productId` | ✅ exists |
| Checkout result | inline in Checkout | ✅ exists |
| My Subscriptions | `/subscriptions` | ✅ exists |
| **Subscription Detail** | `/subscriptions/:id` | ❌ build |
| **Products List** | `/products` | ❌ build |
| **Create Product** | `/products/new` | ❌ build |
| **Edit Product** | `/products/:id/edit` | ❌ build |

---

## Implementation Plan

### Step 1 — Foundation (everything depends on this)

**A. Toast notification system**
- Create `frontend/src/components/ui/Toast.tsx` + `Toast.css`
- Architecture: `ToastContext` + `ToastProvider` (wraps app) + `useToast()` hook
- State shape: `{ id, message, type: 'success'|'error'|'info', exiting: boolean }`
- Lifecycle: auto-dismiss after 3500ms, 300ms exit animation before removal
- Slide-in from top-right, positioned fixed at `top: 72px, right: 20px` (below navbar)
- Manual dismiss via ✕ button

**B. Breadcrumb component**
- Create `frontend/src/components/ui/Breadcrumb.tsx` + `Breadcrumb.css`
- Stateless: accepts `items: { label: string; to?: string }[]`
- Last item has no link and gets `aria-current="page"`

**C. Update `frontend/src/App.tsx`**
- Wrap everything inside `<ToastProvider>` (wraps `<NavBar>` + `<Routes>`)
- Expand NavBar: add "Produtos" link; change active detection from `pathname ===` to `pathname.startsWith()` for both links
- Add 4 new routes:
  ```
  /subscriptions/:id  → SubscriptionDetailPage
  /products           → ProductsPage
  /products/new       → ProductFormPage
  /products/:id/edit  → ProductFormPage
  ```
  Note: `/products/new` before `/products/:id/edit` for clarity; React Router v6 handles specificity

**D. Extend `frontend/src/api/products.api.ts`**
- Add `createProduct(dto: CreateProductDto): Promise<Product>`
- Add `updateProduct(id: string, dto: UpdateProductDto): Promise<Product>`

**E. Update `frontend/src/components/ui/Badge.tsx`**
- Add `INACTIVE` → `'Inativo'` / `badge badge--muted` to the label/class maps
  (ACTIVE already maps via SubscriptionStatus.ACTIVE; it works for ProductStatus.ACTIVE too since values match)

**F. Add CSS utilities to `frontend/src/index.css`**

New CSS blocks to add:
```css
/* Page & card entrance animations */
@keyframes page-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.page-enter { animation: page-enter 0.3s var(--ease) both; }
.card-enter { animation: page-enter 0.3s var(--ease) both; }
.card-enter:nth-child(1) { animation-delay: 0ms; }
/* ... up to nth-child(6) at 300ms */

/* Card hover lift */
.card-hoverable { transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease); }
.card-hoverable:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

/* Transaction timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline__item { display: flex; gap: 16px; position: relative; }
.timeline__connector { position: absolute; left: 11px; top: 24px; bottom: -4px; width: 2px; background: var(--border); }
.timeline__dot { width: 24px; height: 24px; border-radius: 50%; ... }
.timeline__dot--success / --danger variants

/* Billing cycle card selector */
.cycle-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.cycle-option { border: 1px solid var(--border-light); border-radius: var(--radius); ... }
.cycle-option--selected { border-color: var(--accent); background: var(--accent-dim); }

/* Filter tabs */
.filter-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); ... }
.filter-tab { ... }
.filter-tab--active { background: var(--surface-alt); color: var(--text-primary); }

/* Layout utilities */
.page-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.section-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
.pagination { display: flex; align-items: center; gap: 8px; margin-top: 32px; justify-content: center; }
.copy-btn { ... monospace, hover accent color }
.char-counter { font-size: 0.75rem; color: var(--text-muted); }
```

Also add product list card CSS to `frontend/src/App.css`:
```css
.prod-list-card__name-row { display: flex; align-items: flex-start; justify-content: space-between; }
.prod-list-card__description { -webkit-line-clamp: 2; overflow: hidden; color: var(--text-muted); }
```

---

### Step 2 — Products List Page

**Files to create:**
- `frontend/src/pages/Products/index.tsx` (re-export)
- `frontend/src/pages/Products/ProductsPage.tsx`
- `frontend/src/pages/Products/components/ProductCard.tsx`

**`ProductsPage.tsx` state:**
- `useState` for `filter: 'ALL' | ProductStatus` and `page: number`
- `useReducer` for fetch result: `loading | error | loaded`
- `useEffect([filter, page])` → re-fetches from API on change; resets page to 1 on filter change
- Page size: 9 (fills a 3-col grid nicely)

**Layout:**
```
page-enter
  page-toolbar: h1 "Produtos" | Button "+ Novo Produto" → /products/new
  filter-tabs: Todos / Ativos / Inativos
  products-grid:
    skeleton×6  (loading)
    ProductCard×n with card-enter + card-hoverable  (loaded)
    empty-state  (loaded but empty)
  pagination  (if totalPages > 1)
```

**`ProductCard.tsx`:**
- Shows: name, Badge(status), description (2-line clamp), price/cycle
- Buttons: "Assinar" → `/checkout/:id` (only if ACTIVE), "Editar" → `/products/:id/edit`

---

### Step 3 — Product Form Page (Create & Edit)

**Files to create:**
- `frontend/src/pages/Products/ProductFormPage.tsx`
- `frontend/src/pages/Products/components/ProductForm.tsx`

**`ProductFormPage.tsx`:**
- Reads `id` from `useParams`; if present → edit mode, fetches product, pre-fills form
- Loading/error states during product fetch
- On submit success: `showToast('Produto criado/atualizado', 'success')` → `navigate('/products')`
- Breadcrumb: `Produtos / Novo Produto` or `Produtos / Editar Produto`

**`ProductForm.tsx` fields:**
| Field | Input | Notes |
|-------|-------|-------|
| Nome | text | required, max 100 |
| Descrição | textarea | optional, max 300 + char counter |
| Preço | text | user types `29,90` or `29.90` → stored as cents |
| Ciclo | card-based radio (`.cycle-selector`) | 4 options: Mensal/Trimestral/Semestral/Anual |
| Status | filter-tab toggle | **edit mode only** |

**Price handling:**
- Display: `(cents / 100).toFixed(2).replace('.', ',')`
- Submit: `Math.round(parseFloat(value.replace(',', '.')) * 100)`

**Billing cycle selector (the polished touch):** card-based radio with label + sub-label, replaces a boring `<select>`

---

### Step 4 — Subscription Detail Page

**Files to create:**
- `frontend/src/pages/SubscriptionDetail/index.tsx`
- `frontend/src/pages/SubscriptionDetail/SubscriptionDetailPage.tsx`

**Data strategy:** No `GET /subscriptions/:id` endpoint exists. Use React Router navigation state:
- `SubscriptionCard` passes `state={{ subscription }}` via `<Link to={...} state={...}>`
- `SubscriptionDetailPage` reads with `useLocation().state?.subscription`
- Graceful fallback if undefined (direct navigation/refresh): empty-state with "Voltar às assinaturas" link

**Layout:**
```
page-enter
  Breadcrumb: Assinaturas → /subscriptions / {customerName}
  page-toolbar: h1 {snap.name} | Badge(status)

  detail-grid (2 cols)
    Card "Cliente": Nome, E-mail, CPF (masked with maskCpf)
    Card "Assinatura": ID (+ CopyButton), Criada em, Cancelada em (if applicable)

  Card "Produto contratado": product name, price/cycle, description

  [if ACTIVE or PENDING]
  Cancel section — same two-step confirm pattern as SubscriptionCard
  Uses useToast() for success/error feedback; updates local sub state on success

  section-label "Histórico de transações"
  TransactionTimeline component (inline, always expanded)
    — fetches getTransactionsBySubscription(id) on mount
    — renders .timeline with dot–connector structure
    — APPROVED dot: --success, DECLINED dot: --danger
    — shows Badge(status), amount (font-mono), date, failureReason if any
```

**`CopyButton` inline component:** copies subscription ID to clipboard, shows `✓ Copiado` feedback for 2s

---

### Step 5 — Polish existing pages

**`frontend/src/pages/MySubscriptions/components/SubscriptionCard.tsx`**
- Add "Ver detalhes →" link at the bottom of the card (always visible, not just when cancellable):
  ```tsx
  <Link to={`/subscriptions/${subscription._id}`} state={{ subscription }} className="btn-link">
    Ver detalhes →
  </Link>
  ```
- Position: inside or below `sub-card__actions`

**`frontend/src/pages/MySubscriptions/MySubscriptionsPage.tsx`**
- Add `page-enter` class to `<main>`
- Add `card-enter` class to each rendered `SubscriptionCard` wrapper

**`frontend/src/pages/Checkout/CheckoutPage.tsx`**
- Add `page-enter` class to `<main>` elements for entrance animation

---

## Critical Files

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | ToastProvider, new routes, expanded navbar |
| `frontend/src/index.css` | Animations, timeline, cycle-selector, filter-tabs, layout utils |
| `frontend/src/App.css` | Product list card CSS |
| `frontend/src/api/products.api.ts` | createProduct, updateProduct |
| `frontend/src/components/ui/Badge.tsx` | INACTIVE label/class |
| `frontend/src/components/ui/Toast.tsx` | NEW — global notification system |
| `frontend/src/components/ui/Breadcrumb.tsx` | NEW — navigation context |
| `frontend/src/pages/Products/ProductsPage.tsx` | NEW |
| `frontend/src/pages/Products/ProductFormPage.tsx` | NEW — handles create AND edit |
| `frontend/src/pages/Products/components/ProductCard.tsx` | NEW |
| `frontend/src/pages/Products/components/ProductForm.tsx` | NEW |
| `frontend/src/pages/SubscriptionDetail/SubscriptionDetailPage.tsx` | NEW |
| `frontend/src/pages/MySubscriptions/components/SubscriptionCard.tsx` | Add detail link |

---

## Verification

1. `docker compose up -d` → start MongoDB
2. `cd backend && npm run start:dev` → backend on :3000
3. `cd frontend && npm run dev` → frontend on :5173
4. Seed data: use `POST /products` to create 2–3 products
5. Test flows:
   - `/products` → see product grid with status filter and pagination
   - `/products/new` → create a product → toast + redirect
   - `/products/:id/edit` → edit product → toast + redirect
   - `/products` → click "Assinar" → checkout → complete transaction
   - `/subscriptions` → search by CPF → see cards → click "Ver detalhes"
   - `/subscriptions/:id` → see detail, transaction timeline, cancel if ACTIVE
   - Hard-refresh `/subscriptions/:id` → graceful fallback (expected behavior)
   - All pages show skeleton loaders and empty states
   - Cards animate in on page load (staggered)
   - Toast appears on all create/edit/cancel actions
