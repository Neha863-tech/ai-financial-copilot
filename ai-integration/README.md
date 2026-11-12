# FinSight AI — Dedicated AI Integration Microservice

Production-grade, asynchronous AI microservice for **FinSight AI**, built with **FastAPI**, **Python 3.11**, **Groq LLM inference**, and **Scikit-learn / Pandas** statistical modeling.

---

## 1. Architecture Overview

FinSight AI employs a decoupled, multi-tiered architecture where financial ledger state and business transactions are strictly governed by PostgreSQL via Prisma in Node.js, while mathematical simulations, natural language copilot interactions, document OCR, and multi-agent workflows execute inside this Python FastAPI microservice.

```
┌─────────────────────────────────────────────────────────────┐
│                   React 18 Frontend                         │
│   (Vite, TailwindCSS, Chart.js, Lucide Icons, Port 5173)    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Node.js / Express Core     │ │   FastAPI AI Microservice  │
│   (Port 5000)                │ │   (Port 8001)              │
│   • Auth, Sessions, Audits   │ │   • Multi-Agent Engine     │
│   • PayPal capture & webhook │ │   • Groq LLaMA 3.3 70B     │
│   • REST & Internal APIs     │ │   • Scikit-learn Forecast  │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               │  NodeBackendClient REST      │ (Internal Authenticated
               │  ◄───────────────────────────┘  REST Calls)
               ▼
┌──────────────────────────────┐
│      PostgreSQL (Prisma)     │
│    SOLE SOURCE OF TRUTH      │
│  (Ledger, Transactions,      │
│   Budgets, Recurring Bills)  │
└──────────────────────────────┘
```

### Critical Architecture Rules
1. **Source of Truth:** PostgreSQL (accessed via Node.js internal endpoints) is the sole source of truth. The FastAPI microservice **never** maintains duplicate financial balances or independent database stores.
2. **Deterministic Tools First:** All calculations (totals, percentages, category aggregations, standard deviations, affordability simulations) are computed using deterministic Python tools before feeding verified figures to the LLM.
3. **No Financial Hallucination:** The LLM receives verified structured numbers and is prompted under strict constraints never to invent account balances, transaction records, or payment confirmations.
4. **Action Confirmation Guardrail:** Any action that modifies financial commitments (e.g. creating a budget, scheduling a recurring bill) requires explicit user confirmation via an unexecuted proposal plan.

---

## 2. Multi-Agent Ecosystem

The microservice features a coordinated team of 8 specialized agents governed by the `MultiAgentOrchestrator`:

| Agent | Responsibility |
|---|---|
| **MultiAgentOrchestrator** | Detects intent from natural-language queries, gathers user context from Node.js, invokes relevant tools/agents, and synthesizes grounded financial responses. |
| **ExpenseIntelligenceAgent** | High-precision transaction categorization, recurring payment detection, anomaly detection (>2.5σ), and duplicate charge prevention. |
| **FinancialAnalyticsAgent** | Aggregates income, expenses, net savings rate, category breakdowns, and formats structured chart payloads. |
| **BudgetOptimizationAgent** | Evaluates category caps, alerts on budget overruns, and generates actionable, achievable savings plans (e.g., "Save ₹5,000 monthly"). |
| **FinancialForecastingAgent** | Predicts month-end expenses using statistical daily run-rates combined with Scikit-learn Linear Regression, providing 90% confidence uncertainty ranges. |
| **DocumentIntelligenceAgent** | Extracts structured fields (merchant, total, date, tax, items) from PDF/image receipts and invoices, and checks against existing transactions to prevent duplicate imports. |
| **ShoppingIntelligenceAgent** | Runs affordability simulations for target purchases against user's disposable income, budget margins, and upcoming bill commitments. |
| **BillsIntelligenceAgent** | Tracks recurring commitments, upcoming due dates within 7/14/30 days, and flags potential subscription optimizations. |
| **FinancialAutomationAgent** | Prepares structured action proposals (e.g. creating a goal, setting a budget) requiring explicit confirmation before execution. |

---

## 3. Deterministic Financial Tools

All agents rely on tested, deterministic tools in `app/tools/financial_tools.py`:
- `calculate_kpis(transactions)`
- `categorize_transaction(description, amount)`
- `detect_anomalies(transactions, threshold_std)`
- `calculate_category_breakdown(transactions)`
- `forecast_month_end(transactions, historical_monthly_totals)`
- `simulate_affordability(price, income, expenses, recurring_bills, savings_target)`
- `generate_savings_plan(target_amount, target_months, monthly_income, current_expenses)`
- `calculate_bill_commitments(bills, days_ahead)`
- `prepare_action_plan(action_type, payload)`

---

## 4. API Endpoints Reference

Interactive Swagger documentation is available at: **`http://localhost:8001/docs`**

### System & Health
- `GET /health` — Microservice health status, Groq connection, and Node backend connectivity.

### AI Copilot
- `POST /api/v1/copilot/chat` — Conversational copilot with full financial reasoning and tool orchestration.
- `POST /api/v1/copilot/financial-summary` — Real-time executive financial summary and KPI breakdown.

### Expense Intelligence
- `POST /api/v1/expenses/categorize` — Classify transaction into standard categories with confidence score.
- `POST /api/v1/expenses/anomalies` — Scan transactions for statistical outliers (>2.5 std deviations).
- `POST /api/v1/expenses/recurring` — Identify recurring subscription patterns.

### Analytics & Reporting
- `POST /api/v1/analytics/monthly-summary` — Aggregated monthly income, expenses, and savings metrics.
- `POST /api/v1/analytics/breakdown` — Category-wise spending breakdown with percentage distributions.

### Budget & Savings
- `POST /api/v1/budgets/optimize` — Check utilization against limits and recommend reallocations.
- `POST /api/v1/budgets/savings-plan` — Generate step-by-step savings schedule for a target goal.

### Forecasting
- `POST /api/v1/forecast/month-end` — Statistical + Scikit-learn projection of month-end expenditure and surplus.

### Document & Receipt Intelligence
- `POST /api/v1/documents/upload` — Multipart upload for PDF or image receipts with OCR and duplicate detection.
- `POST /api/v1/documents/extract` — Extract financial metadata from raw OCR or statement text.

### Shopping & Affordability
- `POST /api/v1/shopping/affordability` — Real-time simulation of whether the user can afford a purchase.

### Bills & Subscriptions
- `POST /api/v1/bills/commitments` — Summary of upcoming due dates, total commitments, and savings tips.

### Automation Guardrails
- `POST /api/v1/automation/prepare` — Create two-step confirmed action proposals for financial mutations.

---

## 5. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `ENVIRONMENT` | Environment (`development`, `production`, `test`) | `development` |
| `PORT` | Microservice port | `8001` |
| `NODE_BACKEND_URL` | Base URL of Node.js backend | `http://localhost:5000` |
| `NODE_INTERNAL_API_KEY` | Shared secret key for internal service-to-service calls | `finsight_internal_ai_secret_key_2026` |
| `GROQ_API_KEY` | Groq API Key for LLM inference | (Required) |
| `GROQ_MODEL` | Groq model identifier | `llama-3.3-70b-versatile` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:5000` |
| `LOG_LEVEL` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |

---

## 6. Local Setup & Execution

### Prerequisites
- Python 3.11+
- Virtual environment tool (`venv`)

### Installation & Run

```bash
# 1. Navigate to directory
cd ai-integration

# 2. Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
python -m pip install -r requirements.txt

# 4. Start development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The microservice will be live at `http://localhost:8001`.

---

## 7. Automated Test Suite

All 22 unit and integration tests can be executed with Pytest:

```bash
cd ai-integration
python -m pytest tests/ -v
```

Test coverage includes:
- `test_groq_client.py`: Groq client initialization, prompt completion, and fallback resilience.
- `test_financial_tools.py`: Deterministic KPI math, standard deviation anomalies, forecasting, affordability simulations, and savings plans.
- `test_agents.py`: Expense, Analytics, Budget, Forecasting, Shopping, Bills, and MultiAgentOrchestrator workflows.
- `test_api_endpoints.py`: `/health`, `/api/v1/copilot/chat`, `/api/v1/expenses/categorize`, `/api/v1/analytics/monthly-summary`, `/api/v1/forecast/month-end`, `/api/v1/shopping/affordability`, and `/api/v1/bills/commitments`.

---

## 8. Docker & Production Deployment

### Docker Build & Run

```bash
# Build Docker image
docker build -t finsight-ai-microservice .

# Run container
docker run -p 8001:8001 \
  -e GROQ_API_KEY="your-groq-key" \
  -e NODE_BACKEND_URL="http://host.docker.internal:5000" \
  -e NODE_INTERNAL_API_KEY="finsight_internal_ai_secret_key_2026" \
  finsight-ai-microservice
```

### Deploying to Render
1. In the Render Dashboard, create a **New Web Service**.
2. Connect your GitHub repository: `https://github.com/sanchit-195/ai-financial-copilot`.
3. Set **Root Directory** to `ai-integration`.
4. Select **Docker** environment (or Python with Build Command `pip install -r requirements.txt` and Start Command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
5. Configure Environment Variables in Render:
   - `GROQ_API_KEY`: your-groq-api-key
   - `NODE_BACKEND_URL`: `https://ai-financial-copilot-backend.onrender.com`
   - `NODE_INTERNAL_API_KEY`: shared-internal-secret
   - `PORT`: `8001`
6. Click **Create Web Service**.
