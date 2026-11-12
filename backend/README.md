# AI Financial Copilot — Backend API

Node.js, Express, PostgreSQL, and Prisma REST API backend for the **AI Financial Copilot** project.

---

## 1. Technologies & Architecture

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL (with `DECIMAL(18, 2)` monetary handling)
- **ORM:** Prisma v6
- **Authentication:** JWT in HttpOnly cookie & Authorization header + bcryptjs
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, rate limiting, parameterized queries
- **Testing:** Vitest + Supertest
- **Integrations:** PayPal Orders v2 / Webhooks, Google Gemini and Groq (via function/tool calling)

---

## 2. Directory Structure

```text
backend/
├── prisma/
│   ├── schema.prisma          # PostgreSQL models, enums & relations
│   ├── migrations/            # Version-controlled SQL migrations
│   └── seed.js                # Seed system categories, demo user & sample data
├── src/
│   ├── config/                # env, database, paypal, ai
│   ├── controllers/           # HTTP handlers
│   ├── db/                    # Shared Prisma client
│   ├── integrations/
│   │   ├── ai/                # Gemini/Groq providers, tool registry, prompts
│   │   └── paypal/            # PayPal client, orders, reporting, webhooks
│   ├── middlewares/           # auth, validate, error, notFound, rateLimit, requestId
│   ├── routes/                # Express feature routes & index router
│   ├── services/              # Pure business logic & financial calculations
│   ├── utils/                 # ApiError, ApiResponse, asyncHandler, constants, etc.
│   ├── validators/            # Zod validation schemas
│   ├── app.js                 # Express app configuration & middleware pipeline
│   ├── server.js              # Server lifecycle & graceful shutdown
│   └── index.js               # Entry point
├── tests/                     # Unit & integration tests
├── package.json
└── vitest.config.js
```

---
## 4. Setup & Running

### Prerequisites
- Node.js >= 18 LTS
- PostgreSQL running locally and a development database created

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Push schema and seed demo database (One-step setup)
npm run db:setup

# 3. Run automated tests
npm test

# 4. Start development server (auto-links FastAPI AI microservice on 8001)
npm run dev

# 5. Start production server
npm start
```

---

## 5. API Endpoints

All feature endpoints are prefixed with `/api/v1`.

### Health Check
- `GET /health` — Application status and PostgreSQL connection latency
- `GET /api/health` — Application & DB health status
- `GET /api/v1/health` — Versioned health endpoint

### Authentication (`/api/v1/auth`)
- `POST /register` — Register a new account (`fullName`, `email`, `password`)
- `POST /login` — Login with email and password (returns JWT & sets HttpOnly cookie)
- `POST /logout` — Clear session cookie
- `GET /me` — Get current authenticated user profile
- `PATCH /profile` — Update name, preferred currency, or timezone

### Transactions (`/api/v1/transactions`)
- `GET /` — List transactions (paginated, filtered by date, category, status, type, search)
- `POST /` — Create manual transaction (auto-categorized by rules if no category specified)
- `GET /:id` — Get transaction details
- `PATCH /:id` — Update transaction
- `DELETE /:id` — Soft-delete transaction
- `POST /import/csv` — Upload and parse CSV bank statement with deduplication

### Categories (`/api/v1/categories`)
- `GET /` — List system & user categories
- `POST /` — Create custom category
- `PATCH /:id` — Update custom category
- `DELETE /:id` — Delete custom category

### Analytics (`/api/v1/analytics`)
- `GET /summary` — Income, expenses, net cash flow, savings rate for a date range
- `GET /categories` — Category-wise spending breakdown and percentages
- `GET /trends` — Monthly spending trends over time
- `GET /comparison` — Compare current period vs. previous period

### Dashboard (`/api/v1/dashboard`)
- `GET /` — Aggregated dashboard payload (summary, recent txns, budgets, reminders, insights)

### Budgets (`/api/v1/budgets`)
- `GET /` — List budgets with real-time calculated spending, remaining amount, and utilization status (`ON_TRACK`, `WARNING`, `EXCEEDED`)
- `POST /` — Create monthly overall or category budget
- `PATCH /:id` — Update budget limit or note
- `DELETE /:id` — Delete budget

### Savings Simulator (`/api/v1/simulator`)
- `POST /savings` — Calculate deterministic what-if savings projections from historical data

### AI Financial Assistant (`/api/v1/ai`)
- `POST /chat` — Authenticated conversational assistant using the configured Gemini or Groq provider with controlled tool calling
- `GET /conversations` — List user chat conversations
- `GET /conversations/:id` — Get conversation history
- `DELETE /conversations/:id` — Delete conversation

### Insights (`/api/v1/insights`)
- `GET /` — Deterministic financial insights (spending increases, top category, savings rate alerts)

### Recurring Payments (`/api/v1/recurring-payments`)
- `GET /` — List detected & confirmed recurring charges
- `POST /detect` — Trigger pattern-detection algorithm on user transaction history
- `POST /:id/confirm` — Confirm detected subscription
- `POST /:id/dismiss` — Dismiss false positive
- `PATCH /:id` — Update recurring payment details

### Reminders (`/api/v1/reminders`)
- `GET /` — List bill reminders
- `POST /` — Create reminder
- `PATCH /:id` — Update or mark completed
- `DELETE /:id` — Delete reminder

### PayPal Integration (`/api/v1/paypal`)
- `GET /status` — Check PayPal Sandbox configuration status
- `POST /orders` — Create Orders v2 server-side checkout order
- `POST /orders/:orderId/capture` — Capture approved order & persist transaction idempotently
- `POST /reporting/sync` — Sync eligible reporting transactions
- `POST /webhook` — Public verified webhook handler for PayPal events (`PAYMENT.CAPTURE.COMPLETED`, etc.)

---

## 6. Seed Credentials

- **Email:** `demo@example.com`
- **Password:** `DemoPassword123!`
