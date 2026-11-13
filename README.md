# AI Financial Copilot

**Understand your spending. Plan with confidence. Take action with control.**

AI Financial Copilot is a full-stack personal finance application that turns transaction records into useful financial insights. It brings expense tracking, budgeting, savings simulations, and a conversational AI assistant into one place, with PayPal Sandbox Checkout as its payment integration.

## Why we built it

Recording transactions is only the first step. People also need to understand where their money is going, spot changes in spending, and decide what they can realistically save. Traditional expense trackers often leave users to interpret charts and totals on their own.

AI Financial Copilot combines reliable financial calculations with an AI interface that explains the results in plain language. Instead of asking users to search through transaction lists, it lets them ask questions such as:

- How much did I spend on food this month?
- What changed compared with last month?
- Which category is taking the largest share of my expenses?
- Am I staying within my budget?
- How much could I save by reducing shopping expenses by 20%?

The goal is not to let an AI model make financial decisions. It is to make a user's own financial data easier to understand and act on.

## What the application offers

- **Transaction tracking:** Record income and expenses manually or import supported transaction data from a CSV file.
- **Expense categorization:** Categorize transactions using merchant rules, with AI classification available when a rule does not provide a match.
- **Financial dashboard:** Review income, expenses, net cash flow, category-wise spending, and trends over a selected period.
- **Budget planning:** Set monthly overall or category-level budgets and monitor usage.
- **AI financial assistant:** Ask questions in natural language and receive explanations based on the user's financial records.
- **Savings simulator:** Estimate potential savings by choosing a spending category and a reduction percentage.
- **Recurring payment detection:** Identify transactions that appear to repeat and let users review or confirm them.
- **PayPal checkout:** Complete a payment approval and capture flow using PayPal Sandbox.

Features that depend on an external account's permissions, such as PayPal transaction-history reporting, remain subject to that account's eligibility and API access.

## Technology stack

| Area | Technologies | Purpose |
|---|---|---|
| Frontend | React, JavaScript, Vite, React Router | Application interface and navigation |
| Styling and charts | Tailwind CSS, Recharts | Responsive UI and financial visualizations |
| Backend | Node.js, Express.js | REST API and application logic |
| Database | PostgreSQL | Persistent financial and user data |
| ORM | Prisma | Database queries, schema management, and migrations |
| AI | Gemini API with tool/function calling | Expense categorization and conversational financial explanations |
| Payments | PayPal REST APIs, PayPal JavaScript SDK | Sandbox order creation, buyer approval, and payment capture |
| API testing | Postman | Sending requests and checking API behaviour during development |
| Version control | Git, GitHub | Source control and team collaboration |

The backend follows a modular-monolith approach: one Express application, one PostgreSQL database, and separate modules for authentication, transactions, analytics, AI, and PayPal.

## How PayPal is integrated

PayPal is used for an end-to-end checkout workflow, rather than being represented by a static button or logo. The integration uses the **PayPal REST APIs** on the backend and the **PayPal JavaScript SDK** in the browser.

The checkout flow works as follows:

1. The user chooses a supported checkout action in the application.
2. The frontend asks the Express API to create an order.
3. The backend validates the amount and currency, obtains an OAuth 2.0 access token using the PayPal app credentials, and creates an order through **PayPal Orders v2**.
4. The PayPal JavaScript SDK presents the buyer approval experience.
5. After the buyer approves the order, the frontend asks the backend to capture it.
6. The backend captures the order with PayPal, checks the response, and records the successful payment in the application's transaction history.
7. PayPal webhooks can be used to verify and reconcile payment events. Webhook events are processed idempotently so that a repeated notification does not create duplicate financial records.

### Why the backend handles payment operations

The PayPal Client Secret and OAuth access token stay on the server. The browser receives only the information needed to display the PayPal approval interface. The backend also validates the payable amount instead of trusting a total supplied by the client.

### Sandbox and transaction-history access

The integration is configured for **PayPal Sandbox** during development and demonstrations. Sandbox payments are simulated and do not represent transfers of real money.

PayPal Checkout and PayPal Transaction Search are separate capabilities. Checkout records the orders created through this application. Transaction Search may be used to import reporting data from an eligible, configured PayPal account, but it is not a universal bank or wallet account aggregator. Access to third-party transaction data can require PayPal partner eligibility, and reporting data may not be available immediately. Manual entry and CSV import provide alternatives for other transaction sources.

The checkout workflow should not be described as automatic payment of arbitrary electricity, internet, or subscription bills. It is a payment to the merchant configured for the checkout order.

## How AI is used

AI is used to make financial information easier to interpret, not to act as the source of financial truth.

### 1. Expense categorization

The application first checks deterministic merchant/category rules. For example, known food-delivery merchants can be categorized as **Food & Dining**, while known transport services can be categorized as **Transport**. When those rules cannot classify a transaction, the AI provider can be asked to return a category, confidence score, and short reason in a structured format.

The backend validates the returned category and confidence. A low-confidence result can be sent for user review. The model is not allowed to modify the transaction amount, currency, date, direction, or source.

### 2. Natural-language financial assistant

When a user asks a question, the backend decides which approved financial function is relevant. Depending on the question, these functions can retrieve:

- Income, expenses, net cash flow, and savings rate for a date range.
- Category-wise expense totals.
- Comparisons between two periods.
- Budget limits, current spending, and remaining amounts.
- Detected or confirmed recurring payments.
- Upcoming reminders.
- Savings estimates from the simulator.
- Recent transaction summaries.

The backend executes these functions against the authenticated user's records and sends the relevant results to the language model. The model then turns those results into a readable explanation.

### 3. Reliable calculations and user control

Financial totals, percentage changes, budget usage, and savings estimates are calculated by backend services—not guessed by the language model. The AI does not run arbitrary SQL or receive unrestricted access to the database. Each financial tool is scoped to the authenticated user, and payment actions require a separate user-approved PayPal checkout flow.

This design keeps the responsibilities clear: **the backend calculates; the AI explains.**

## Application architecture

```text
                 React + Vite frontend
       Dashboard | Transactions | Budgets | AI Assistant
                         |
                    REST API
                         |
                 Node.js + Express
                         |
       +-----------------+------------------+
       |                 |                  |
   Finance module     AI module       PayPal module
       |                 |                  |
       |            Gemini API        PayPal REST APIs
       |            + tool calls      + Orders v2
       |                                + Webhooks
       +-----------------+------------------+
                         |
                      Prisma
                         |
                    PostgreSQL
```

## Local setup

### Prerequisites

- Node.js LTS and npm
- PostgreSQL
- Git
- A Gemini API key (or the AI provider configured for your project)
- PayPal Developer account and Sandbox REST application credentials for checkout testing

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-financial-copilot
```

Replace `<repository-url>` with the GitHub URL for this project.

### 2. Create the database

Create a PostgreSQL database named `financial_copilot`, or use another database name and update the connection string in the backend environment file.

### 3. Configure and run the backend

```bash
cd backend
npm install
```

Create `backend/.env` from the example file:

```bash
cp .env.example .env
```

Set the environment variables before starting the server:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000

DATABASE_URL="postgresql://postgres:password@localhost:5432/financial_copilot?schema=public"

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
COOKIE_NAME=afc_session

AI_PROVIDER=gemini
AI_API_KEY=your_ai_api_key
AI_MODEL=your_tool_calling_model
AI_TEMPERATURE=0.2
AI_MAX_TOOL_ROUNDS=4

PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
PAYPAL_CURRENCY=USD

MAX_CSV_FILE_SIZE_MB=5
```

Generate the Prisma client, apply the database migrations, and seed the database if the seed script is configured:

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

Start the backend:

```bash
npm run dev
```

The API is expected to be available at `http://localhost:5000/api/v1`, with the health endpoint at `http://localhost:5000/health`.

### 4. Configure and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Set the frontend environment variables in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
VITE_PAYPAL_CURRENCY=USD
```

Start the frontend:

```bash
npm run dev
```

Vite serves the application at `http://localhost:5173` by default.

> **Windows note:** If `cp` is unavailable in your terminal, copy `.env.example` to `.env` using File Explorer or PowerShell.

### Environment variable security

Never commit `.env` files. Keep `DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY`, and `PAYPAL_CLIENT_SECRET` on the backend. Only the PayPal Client ID required by the JavaScript SDK should be exposed through the frontend environment.

## Importing transaction data

The CSV importer is intended for transaction files with the following columns:

```csv
date,description,merchant,amount,currency,type,category
2026-11-05,Food delivery,Example Food,450.00,INR,EXPENSE,Food & Dining
2026-11-06,Monthly allowance,Family,12000.00,INR,INCOME,Other Income
```

Dates, decimal amounts, currency codes, and transaction types should be validated during import. Invalid rows should be reported rather than silently added. Avoid importing sensitive information that the application does not need.

## API testing

Postman can be used to test the backend REST API during development. Configure a local environment with the API base URL (`http://localhost:5000/api/v1`) and test the relevant authentication, transaction, analytics, AI, and PayPal routes. For authenticated endpoints, first establish a valid application session and send requests with the required authentication cookie.

## Deployment

The application can be deployed with a frontend hosting provider, a Node.js backend host, and a managed PostgreSQL database. **Render** is one option for hosting the Express backend. A deployed PayPal webhook requires a publicly reachable HTTPS endpoint.

For a deployment:

- Configure the production database URL and run Prisma migrations.
- Set the frontend origin and backend CORS configuration correctly.
- Add AI and PayPal credentials through the hosting provider's environment-variable or secret settings.
- Keep PayPal in Sandbox mode for a hackathon demo unless a separate Live setup has been completed and verified.
- Configure the PayPal webhook against the deployed HTTPS backend URL.
- Verify authentication, database access, AI responses, and a complete Sandbox checkout after deployment.

No live deployment URL is included here because one was not provided with the source README.

## Important limitations

- PayPal Sandbox transactions are simulated and do not move real money.
- PayPal Transaction Search access depends on account context, permissions, and eligibility; it should not be presented as universal account aggregation.
- PayPal reporting data may be delayed. Checkout capture and reporting sync should be treated as separate flows.
- The application provides budgeting and spending insights. It is not a regulated investment, tax, lending, or legal-advice service.
- Savings simulations and forecasts are estimates based on the selected inputs and historical data, not guaranteed outcomes.
- Recurring-payment detection identifies likely patterns; users should review and confirm them.
- Transactions in different currencies should remain separate unless a currency-conversion service and an explicit exchange rate are used.

## Project structure

```text
ai-financial-copilot/
├── frontend/                 # React application
│   └── src/
│       ├── components/       # Shared UI and layout components
│       ├── features/         # Dashboard, transactions, budgets, AI, PayPal, etc.
│       ├── hooks/
│       ├── context/
│       └── lib/
├── backend/                  # Express application
│   ├── prisma/               # Prisma schema, migrations, seed data
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── integrations/
│   │   │   ├── ai/
│   │   │   └── paypal/
│   │   └── utils/
│   └── tests/
└── docs/                     # Project and integration documentation
```

## Team

Built by a five-member team for the PayPal AI/ML Hackathon.

## Deployment & Team Guides

- **Frontend on Vercel**: See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for 1-click Vercel frontend deployment with global edge CDN and automatic client-side SPA routing.
- **Full-Stack on Render**: See [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) for 1-click Blueprint deployment of PostgreSQL, Node.js Backend, and FastAPI AI Service via `render.yaml`.
- **Local Team Collaboration**: See [TEAM_COLLABORATION_GUIDE.md](TEAM_COLLABORATION_GUIDE.md) for 1-command startup (`npm start`), test suites, and troubleshooting tips.

## Useful documentation

- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Orders v2](https://developer.paypal.com/api/rest/integration/orders-api/)
- [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/docs/latest/api/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma](https://www.prisma.io/docs)
- [Vite](https://vite.dev/guide/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)

---

**AI Financial Copilot** — turning transaction history into financial understanding and practical next steps.
