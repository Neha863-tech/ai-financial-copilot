# FinSight AI frontend

The frontend is a React, TypeScript, and Vite application. It uses the authenticated Express API in `backend` for financial data; financial screens do not fall back to local demo data.

## Requirements

- Node.js 18 or newer
- The backend running at `http://localhost:5000`
- A configured PostgreSQL database for the backend

## Run locally

1. Configure and start the backend using [the backend setup guide](../backend/README.md).
2. In this directory, install dependencies and start Vite:

   ```powershell
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173` and register or sign in.

The frontend API base defaults to `http://localhost:5000/api/v1`. To override it, set `VITE_API_BASE_URL` in `frontend/.env`. Keep secrets such as database credentials, AI keys, and PayPal secrets in `backend/.env`; never put them in a `VITE_*` variable.

## Backend-dependent features

Authentication, dashboard data, transactions and CSV import, category budgets, analytics, recurring-payment detection, reminders, savings simulation, financial chat, and PayPal checkout are backed by API endpoints. AI chat requires the backend AI provider and API key to be configured. PayPal checkout requires PayPal Sandbox credentials. Without an optional provider configuration, the relevant feature reports an error instead of presenting a successful mock result.

CSV import expects a header row with a date, amount, and transaction type column. Merchant/description, currency, and category are optional; imported rows are validated by the backend.
