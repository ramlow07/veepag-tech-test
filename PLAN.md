# Veepag Tech Test — Architectural Plan

**Strategy**: Nail Core MVP first, impress with improvements later. 8-hour window.

---

## Context

Build a Recurring Subscription Checkout system. Users browse a product via a checkout link, subscribe (triggering a simulated payment), and manage subscriptions by CPF. The recruiter evaluates: architecture, MongoDB modeling, error handling, test quality, and ability to anticipate problems.

---

## 1. DATA MODELING (MongoDB)

### 1.1 Product — `products` collection

| Field          | Type     | Constraints                      |
| -------------- | -------- | -------------------------------- | --------------------------- | ---------- | ------- |
| `_id`          | ObjectId | Auto                             |
| `name`         | String   | required, trim, 3–120 chars      |
| `description`  | String   | optional, max 500 chars          |
| `price`        | Number   | required, integer (cents), min 1 |
| `billingCycle` | Enum     | `MONTHLY                         | QUARTERLY                   | SEMIANNUAL | ANNUAL` |
| `status`       | Enum     | `ACTIVE                          | INACTIVE`— default:`ACTIVE` |
| `createdAt`    | Date     | timestamps: true                 |
| `updatedAt`    | Date     | timestamps: true                 |
| `currency`     | String   | default: 'BRL'                   | required: true              |

**Design decisions:**

- **Price in cents (integer)**: avoids floating-point bugs; industry standard (Stripe, Adyen)
- **Soft-delete via status**: products are never deleted, preserving historical integrity

**Indexes:**

- `{ status: 1 }` — filter active products efficiently
- `{ createdAt: -1 }` — default sort for listing

---

### 1.2 Subscription — `subscriptions` collection

| Field                | Type     | Constraints                                                    |
| -------------------- | -------- | -------------------------------------------------------------- | ------ | -------------- | ----------------------------- |
| `_id`                | ObjectId | Auto                                                           |
| `productId`          | ObjectId | required, ref: Product                                         |
| `productSnapshot`    | Object   | `{ name, price, billingCycle }` — captured at creation         |
| `customerName`       | String   | required, 2–120 chars                                          |
| `customerEmail`      | String   | required, valid email                                          |
| `customerCpf`        | String   | required, exactly 11 digits (stripped), CPF checksum validated |
| `status`             | Enum     | `PENDING                                                       | ACTIVE | PAYMENT_FAILED | CANCELLED`— default:`PENDING` |
| `cancelledAt`        | Date     | null unless cancelled                                          |
| `cancellationReason` | String   | optional, max 300 chars                                        |
| `createdAt`          | Date     | timestamps: true                                               |
| `updatedAt`          | Date     | timestamps: true                                               |

**Design decisions:**

- **productSnapshot**: denormalizes name, price, billingCycle at subscription time. Prevents broken data if product price changes or product is deactivated. This is how Stripe subscriptions work.
- **CPF stored as 11-digit string** (no formatting): consistent lookup, indexable
- **No Customer entity**: CPF + name + email are captured per subscription. Avoids a premature Customer model that adds complexity without benefit at this scope

**Indexes:**

- `{ customerCpf: 1 }` — primary lookup for "My Subscriptions" page
- `{ productId: 1 }` — filter subscriptions by product
- `{ status: 1 }` — filter by status
- `{ customerCpf: 1, productId: 1, status: 1 }` — compound index for duplicate-active check

---

### 1.3 Transaction — `transactions` collection

| Field            | Type     | Constraints                                                            |
| ---------------- | -------- | ---------------------------------------------------------------------- | ------------ | ------------- |
| `_id`            | ObjectId | Auto                                                                   |
| `subscriptionId` | ObjectId | required, ref: Subscription                                            |
| `amount`         | Number   | required, integer (cents), matches productSnapshot.price               |
| `status`         | Enum     | `APPROVED                                                              | DECLINED`    |
| `failureReason`  | String   | null if approved; `insufficient_funds                                  | card_expired | do_not_honor` |
| `paymentDetails` | Object   | `{ cardHolderName, cardLastFour, cardBrand, expiryMonth, expiryYear }` |
| `createdAt`      | Date     | timestamps: true                                                       |
| `processedAt`    | Date     | timestamp when simulation ran                                          |

**Design decisions:**

- **Never store full card numbers or CVV** — only last 4 digits + brand. PCI-DSS mindset even in simulation
- **amount copied from productSnapshot** — transaction is a financial record; immutable snapshot of what was charged
- **Separate collection (not embedded)** — subscriptions will accumulate renewal transactions over time; embedding would cause unbounded document growth

**Indexes:**

- `{ subscriptionId: 1 }` — list all transactions for a subscription

---

### 1.4 Status Enums Summary

```
ProductStatus:     ACTIVE | INACTIVE

SubscriptionStatus:
  PENDING        → Created, awaiting payment result
  ACTIVE         → Payment approved; subscription is live
  PAYMENT_FAILED → Payment declined; subscription did not activate
  CANCELLED      → Cancelled by customer (terminal)

TransactionStatus: APPROVED | DECLINED

TransactionFailureReason: insufficient_funds | card_expired | do_not_honor
```

---

## 2. ARCHITECTURE & FOLDER STRUCTURE

### 2.1 Backend — NestJS

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── database.config.ts          # MongoDB URI + options
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       └── cpf.utils.ts            # CPF format + checksum validation
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── schemas/
│   │   │   └── product.schema.ts
│   │   ├── enums/
│   │   │   └── product-status.enum.ts
│   │   ├── products.controller.ts
│   │   ├── products.repository.ts      # DB access only
│   │   ├── products.service.ts         # Business logic only
│   │   ├── products.module.ts
│   │   └── products.service.spec.ts
│   ├── subscriptions/
│   │   ├── dto/
│   │   │   ├── create-subscription.dto.ts
│   │   │   └── filter-subscriptions.dto.ts
│   │   ├── schemas/
│   │   │   └── subscription.schema.ts
│   │   ├── enums/
│   │   │   └── subscription-status.enum.ts
│   │   ├── subscriptions.controller.ts
│   │   ├── subscriptions.repository.ts
│   │   ├── subscriptions.service.ts
│   │   ├── subscriptions.module.ts
│   │   └── subscriptions.service.spec.ts
│   └── transactions/
│       ├── dto/
│       ├── schemas/
│       │   └── transaction.schema.ts
│       ├── enums/
│       │   ├── transaction-status.enum.ts
│       │   └── failure-reason.enum.ts
│       ├── payment-simulator.service.ts  # Isolated simulation logic
│       ├── transactions.controller.ts
│       ├── transactions.repository.ts
│       ├── transactions.service.ts
│       ├── transactions.module.ts
│       └── payment-simulator.service.spec.ts
├── test/
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```

**Pattern**: Controller (HTTP) → Service (business logic) → Repository (DB). Services depend on repositories via constructor injection. This enables easy unit testing by mocking the repository.

---

### 2.2 Frontend — React + Vite

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                         # Router setup
│   ├── api/
│   │   ├── client.ts                   # Axios instance with base URL
│   │   ├── products.api.ts
│   │   ├── subscriptions.api.ts
│   │   └── transactions.api.ts
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── subscription.types.ts
│   │   └── transaction.types.ts
│   ├── utils/
│   │   ├── cpf.utils.ts                # CPF mask + validation
│   │   └── format.utils.ts             # Currency, date formatting
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx               # Status badge (ACTIVE=green, CANCELLED=red, etc.)
│   │       └── Card.tsx
│   └── pages/
│       ├── Checkout/
│       │   ├── CheckoutPage.tsx         # Orchestrator
│       │   ├── checkout.reducer.ts      # useReducer state: idle|loading|product_found|submitting|success|error
│       │   ├── checkout.types.ts
│       │   └── components/
│       │       ├── ProductCard.tsx      # Display product after search
│       │       └── CheckoutForm.tsx     # Customer info + payment fields
│       └── MySubscriptions/
│           ├── MySubscriptionsPage.tsx
│           ├── subscriptions.reducer.ts # useReducer state: idle|loading|loaded|cancelling|error
│           ├── subscriptions.types.ts
│           └── components/
│               ├── SubscriptionCard.tsx # Shows status badge + cancel button
│               └── TransactionHistory.tsx
├── index.html
├── package.json
└── vite.config.ts
```

**State management via `useReducer`**: as required by spec. Each page owns its reducer. No global state needed — data is fetched per-page, per-action.

---

## 3. BUSINESS RULES & STATE MACHINE

### 3.1 Subscription State Machine

```
                     [POST /subscriptions]
                            │
                            ▼
                        [PENDING]
                       /         \
          Payment           Payment
          APPROVED           DECLINED
              │                   │
              ▼                   ▼
          [ACTIVE]        [PAYMENT_FAILED]
              │
    PATCH /subscriptions/:id/cancel
              │
              ▼
         [CANCELLED]  ← terminal state

Legend:
- CANCELLED is terminal: no transitions out
- PAYMENT_FAILED is terminal: retry = new subscription
- ACTIVE → PENDING (future: renewal billing cycle) — out of scope for MVP
```

### 3.2 Payment Simulation Algorithm

`PaymentSimulatorService.simulate(paymentDetails)` applies rules in order:

| Priority | Condition                                                                                     | Result   | Reason               |
| -------- | --------------------------------------------------------------------------------------------- | -------- | -------------------- |
| 1        | `expiryYear < currentYear` OR (`expiryYear === currentYear` AND `expiryMonth < currentMonth`) | DECLINED | `card_expired`       |
| 2        | `cardLastFour === '0000'`                                                                     | DECLINED | `do_not_honor`       |
| 3        | `cardLastFour === '0002'`                                                                     | DECLINED | `insufficient_funds` |
| 4        | All other cases                                                                               | APPROVED | —                    |

**README note**: Mirrors Stripe's test card approach. Use `0002` to simulate insufficient funds, `0000` for a hard decline. Any other card last-4 + valid expiry = approval. CVV is accepted but never evaluated (simulation).

### 3.3 Validation Rules & HTTP Codes

| Rule                                                      | HTTP Code                  |
| --------------------------------------------------------- | -------------------------- |
| Product not found                                         | `404 Not Found`            |
| Product status is INACTIVE                                | `422 Unprocessable Entity` |
| CPF format invalid (not 11 digits)                        | `400 Bad Request`          |
| CPF checksum invalid                                      | `400 Bad Request`          |
| Customer already has ACTIVE subscription for this product | `409 Conflict`             |
| Subscription not found (cancel)                           | `404 Not Found`            |
| Cancel a CANCELLED subscription                           | `409 Conflict`             |
| Cancel a PAYMENT_FAILED subscription                      | `409 Conflict`             |
| Request body validation failure (class-validator)         | `400 Bad Request`          |

### 3.4 Edge Cases to Protect Against

1. **Duplicate active subscription**: Same CPF + same productId + status ACTIVE → block with 409. Query uses compound index `{ customerCpf, productId, status }`.
2. **Price change after subscription**: Handled by productSnapshot. The transaction amount always comes from `subscription.productSnapshot.price`, never re-fetched from product.
3. **Product deactivated after subscription**: Existing ACTIVE subscriptions are unaffected. The `productId` reference is kept for traceability, but billing uses the snapshot.
4. **Cancel non-cancellable states**: Only `ACTIVE` and `PENDING` subscriptions can be cancelled. Others return 409.
5. **CPF with formatting**: Strip all non-numeric characters before validation and storage (accept `123.456.789-09` or `12345678909`).
6. **Concurrent duplicate creation**: Application-level check is sufficient for this scope. True race condition protection (MongoDB unique index + retry) noted as future improvement.

---

## 4. API CONTRACTS

### Products

```
POST   /products
  Body: { name, description?, price, billingCycle }
  201: Product document
  400: Validation errors

GET    /products/:id
  Params: id (ObjectId)
  200: Product document
  404: Product not found

GET    /products
  Query: status? (default: ACTIVE), page?, limit?
  200: { data: Product[], total }

PATCH  /products/:id
  Body: Partial<{ name, description, price, billingCycle, status }>
  200: Updated product
  404: Not found
```

### Subscriptions

```
POST   /subscriptions
  Body: {
    productId,
    customerName, customerEmail, customerCpf,
    paymentDetails: { cardHolderName, cardLastFour, cardBrand, expiryMonth, expiryYear }
  }
  201: { subscription, transaction }   ← both returned together
  400: Validation / CPF error
  404: Product not found
  409: Duplicate active subscription
  422: Product inactive

GET    /subscriptions
  Query: status?, productId?, page?, limit?
  200: { data: Subscription[], total }

GET    /subscriptions/customer/:cpf
  Params: cpf (11 digits)
  200: Subscription[] (all statuses, ordered by createdAt desc)
  400: Invalid CPF format

PATCH  /subscriptions/:id/cancel
  Body: { cancellationReason? }
  200: Updated subscription (status: CANCELLED)
  404: Not found
  409: Already cancelled or PAYMENT_FAILED
```

### Transactions

```
GET    /transactions/subscription/:subscriptionId
  Params: subscriptionId (ObjectId)
  200: Transaction[]
  404: Subscription not found
```

---

## 5. STEP-BY-STEP EXECUTION SEQUENCE

### Phase 1 — Scaffolding (0:00–0:30)

- [ ] `nest new backend` (Express adapter, strict mode)
- [ ] `npm i @nestjs/mongoose mongoose class-validator class-transformer`
- [ ] `npm i -D @types/mongoose jest @nestjs/testing`
- [ ] `npm create vite@latest frontend -- --template react-ts`
- [ ] `npm i axios react-router-dom`
- [ ] Create `docker-compose.yml` with MongoDB service (port 27017, named volume for persistence)
- [ ] Create `.env` with `MONGODB_URI=mongodb://localhost:27017/veepag`, `PORT=3000`
- [ ] Wire `MongooseModule.forRoot()` in `AppModule`
- [ ] `docker compose up -d` → verify connection is live

### Phase 2 — Schemas & Enums (0:30–1:00)

- [ ] Define `product.schema.ts` (all fields + indexes via `@index` decorator)
- [ ] Define `subscription.schema.ts` (productSnapshot subdoc, all enums)
- [ ] Define `transaction.schema.ts` (paymentDetails subdoc)
- [ ] Define all enum files (`product-status`, `subscription-status`, `transaction-status`, `failure-reason`)
- [ ] Write `cpf.utils.ts` with format + checksum validation

### Phase 3 — Products Module (1:00–2:00)

- [ ] `products.repository.ts`: `create`, `findById`, `findAll`, `update`
- [ ] `products.service.ts`: `create`, `findById`, `findAll`, `update` — with validation
- [ ] `products.controller.ts`: 4 routes wired to service
- [ ] `products.service.spec.ts`: test create (happy), create (validation fail), findById (not found)

### Phase 4 — Transactions + Subscriptions Modules (2:00–3:30)

- [ ] `payment-simulator.service.ts`: pure function `simulate(details)` → `{ status, failureReason }`
- [ ] `transactions.repository.ts`: `create`, `findBySubscriptionId`
- [ ] `transactions.service.ts`: `createForSubscription`, `findBySubscriptionId`
- [ ] `subscriptions.repository.ts`: `create`, `findById`, `findByCpf`, `findAll`, `update`, `findActiveByProductAndCpf`
- [ ] `subscriptions.service.ts`:
  - `create(dto)`: validate product → validate CPF → check duplicate → create subscription PENDING → simulate payment → create transaction → update subscription status → return both
  - `findByCpf(cpf)`: validate CPF → query
  - `findAll(filters)`: paginated
  - `cancel(id, reason)`: validate subscription exists → validate status → update to CANCELLED
- [ ] `subscriptions.controller.ts`: 4 routes

### Phase 5 — Unit Tests (3:30–4:00)

- [ ] `subscriptions.service.spec.ts`:
  - `create` — product not found (404)
  - `create` — product inactive (422)
  - `create` — duplicate active subscription (409)
  - `create` — payment approved → subscription ACTIVE
  - `create` — payment declined → subscription PAYMENT_FAILED
  - `cancel` — happy path → CANCELLED
  - `cancel` — already cancelled (409)
- [ ] `payment-simulator.service.spec.ts`:
  - Approved card
  - Declined: card_expired
  - Declined: do_not_honor (0000)
  - Declined: insufficient_funds (0002)
- [ ] Run `jest --coverage` → verify ≥70%

### Phase 6 — Frontend Setup (4:00–4:30)

- [ ] Setup `react-router-dom` with routes: `/checkout/:productId` and `/subscriptions`
- [ ] Create `api/client.ts` (axios with base URL from env)
- [ ] Create all `*.api.ts` files (thin wrappers over axios)
- [ ] Create shared UI components: `Button`, `Input`, `Badge`, `Card`
- [ ] Define all TypeScript `types/` files mirroring backend models

### Phase 7 — Checkout Page (4:30–6:00)

- [ ] `checkout.reducer.ts`:
  - States: `idle | loading | product_loaded | submitting | success | error`
  - Actions: `SEARCH_PRODUCT | PRODUCT_FOUND | PRODUCT_ERROR | SUBMIT | SUBMIT_SUCCESS | SUBMIT_ERROR`
- [ ] `CheckoutPage.tsx`: reads `:productId` from URL → auto-fetches product on mount
- [ ] `ProductCard.tsx`: displays name, description, price (formatted from cents), billing cycle
- [ ] `CheckoutForm.tsx`: fields for name, email, CPF (masked), card holder, last 4, brand, expiry month/year
- [ ] On submit success: show result card (APPROVED → green, DECLINED → red with reason)

### Phase 8 — My Subscriptions Page (6:00–7:00)

- [ ] `subscriptions.reducer.ts`:
  - States: `idle | loading | loaded | cancelling | error`
  - Actions: `SEARCH | LOADED | ERROR | CANCEL | CANCELLED | CANCEL_ERROR`
- [ ] `MySubscriptionsPage.tsx`: CPF input + search button
- [ ] `SubscriptionCard.tsx`: shows product name, price, billing cycle, status badge, cancel button (only for ACTIVE)
- [ ] Cancel flow: confirm → PATCH → optimistic update in reducer state
- [ ] `TransactionHistory.tsx`: collapsible per subscription; shows amount, status, date

### Phase 9 — Polish & README (7:00–8:00)

- [ ] Global error handling: `HttpExceptionFilter` on backend, axios interceptor on frontend
- [ ] `README.md`:
  - How to run (env vars, `docker compose up -d`, `npm run start:dev`, `npm run dev`)
  - Technical decisions (price in cents, productSnapshot, CPF validation, repository pattern)
  - Business rules implemented
  - Payment simulation rule (exact card numbers for approved/declined)
  - Future improvements (MongoDB transactions for atomicity, renewal billing, customer auth)
- [ ] Final: `git push` to public repo

---

## Critical Files

| File                                                          | Role                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `backend/src/common/utils/cpf.utils.ts`                       | CPF validation — used in multiple services                                               |
| `backend/src/transactions/payment-simulator.service.ts`       | Core simulation logic — must be pure/testable                                            |
| `backend/src/subscriptions/subscriptions.service.ts`          | Most complex service — orchestrates product check, duplicate check, payment, transaction |
| `backend/src/subscriptions/schemas/subscription.schema.ts`    | productSnapshot subdoc definition — must be right first time                             |
| `frontend/src/pages/Checkout/checkout.reducer.ts`             | State machine for checkout UX                                                            |
| `frontend/src/pages/MySubscriptions/subscriptions.reducer.ts` | State machine for subscriptions UX                                                       |

---

## Verification Checklist

- [ ] `POST /products` creates product, returns 201
- [ ] `GET /products/:id` with INACTIVE product → returns 422 on subscription attempt
- [ ] `POST /subscriptions` with card `0002` → transaction DECLINED, subscription PAYMENT_FAILED
- [ ] `POST /subscriptions` with card `4242` (or any valid non-magic last-4) → APPROVED, subscription ACTIVE
- [ ] `POST /subscriptions` same CPF + same product + ACTIVE → 409
- [ ] `PATCH /subscriptions/:id/cancel` on ACTIVE → 200 CANCELLED
- [ ] `PATCH /subscriptions/:id/cancel` on CANCELLED → 409
- [ ] `GET /subscriptions/customer/:cpf` returns all subscriptions for CPF
- [ ] `GET /transactions/subscription/:id` returns all transactions
- [ ] `jest --coverage` passes ≥70%
- [ ] Frontend: checkout flow end-to-end from product display to result
- [ ] Frontend: my subscriptions CPF search → list → cancel
