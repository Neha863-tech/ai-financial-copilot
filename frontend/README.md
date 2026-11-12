# FinSight AI 💳🧠
> **Your Money. Your Insights. Your Control.**  
> *PayPal AI Hackathon | Full-Stack AI-Powered Personal Finance Platform*

---

## 📌 Executive Summary

**FinSight AI** is a production-quality, intelligent personal finance ecosystem combining payment processing, transaction tracking, financial analytics, budgeting, shopping intelligence, and a 6-agent AI mesh.

Instead of simply displaying static expense records, FinSight AI understands spending patterns, detects unusual charges, predicts future cash flows, recommends practical adjustments, and integrates with the **PayPal REST API & Developer Sandbox** in an automated **Payment-to-Insight pipeline**.

---

## ⚡ Core Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, AG Grid Community, Recharts, Lucide React, Framer Motion, `@paypal/react-paypal-js`, Sonner.
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (local or hosted), Zod, JWT.
- **AI & Multi-Agent Mesh:** Groq API (`llama-3.3-70b-versatile`), Central AI Orchestrator with 6 specialized domain agents, deterministic decimal-safe financial math.
- **Payment Gateway:** PayPal REST APIs (v2 Orders & Captures), PayPal Developer Sandbox, PayPal Webhooks with idempotent processing.

---

## 🧭 Application Modules & Navigation

| Module | Route / View | Key Features |
| :--- | :--- | :--- |
| **1. Overview** | `Overview` | KPI Cards (Income, Expenses, Savings, Budget), Recharts Cash Flow Area Chart, "Where It Goes" Donut Chart, AI Insight Banner, Budget Health progress, and Monthly Printable Review Modal. |
| **2. Transactions** | `Transactions` | **AG Grid** financial data grid with multi-column sorting, live search, category filter, CSV export, CSV import, and Add Transaction entry modal. |
| **3. Purchases & Orders** | `Purchases & Orders` | Item-level shopping records with product images, order IDs, delivery status, and linked PayPal transactions. Channel3 discovery ready. |
| **4. Spending Analysis** | `Spending Analysis` | Daily spending rhythm BarChart (Mon-Sun), Weekend vs. Weekday metrics (+32% spike detection), recurring charge detection, and anomaly flags. |
| **5. Budgets** | `Budgets` | Category limits, allocated vs. spent meters, and proactive overspending alerts (e.g. Shopping at 127%). |
| **6. AI Financial Assistant** | `AI Financial Assistant` | Full-screen ChatGPT + fintech chat with 6 specialized agents, live context snapshot, deterministic tool verification badges, and suggested prompts. |
| **7. Financial Forecast** | `Financial Forecast` | What-if scenario simulator with reduction slider (0–50%), live savings calculation, and 12-month exponential projection area chart. |
| **8. Bills & Subscriptions** | `Bills & Subscriptions` | Upcoming obligations scheduler (Rent, Electricity, Netflix, Wifi) with due dates, frequencies, and Bryntum reminder sync. |
| **9. Connected Accounts** | `Connected Accounts` | Honest connection statuses for PayPal Developer Sandbox, HDFC Net Banking, ICICI Credit Card, and statement imports. |
| **10. Settings** | `Settings` | Profile, preferred currency, baseline monthly income, and savings targets. |

---

## 🤖 The 6-Agent AI Financial Mesh

```
                     [ FinSight Central Orchestrator ]
                     /       |        |       |      \
                    /        |        |       |       \
               [Expense] [Analytics] [Budget] [Bills] [Shopping]
                                      |
                                  [Forecast]
```

1. **Expense Intelligence Agent:** Identifies unusual expenditures, recurring charges, and weekend dining spikes.
2. **Financial Analytics Agent:** Compares multi-month income and expense trends with deterministic calculations.
3. **Budget Optimization Agent:** Recommends category reallocations to prevent budget breaches.
4. **Bill & Subscription Agent:** Tracks upcoming due dates and summarizes payment obligations.
5. **Shopping Intelligence Agent:** Answers questions like *"Can I afford a laptop worth ₹65,000?"* by cross-referencing available liquidity, remaining category budgets, and upcoming bills.
6. **Financial Forecasting Agent:** Simulates compound savings trajectories based on behavioral adjustments.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **PostgreSQL** running locally on port 5432 (or a hosted instance e.g. Neon/Supabase)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure PostgreSQL database URL in backend/.env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finsight_ai?schema=public

# Sync schema and generate Prisma client:
npx prisma db push

# Seed demo financial data for Arjun Sharma:
npx tsx prisma/seed.ts

# Start Express server (runs on http://localhost:5000):
npm run dev
```

### 3. Frontend Setup
```bash
# In the root project directory:
npm install

# Start Vite dev server (runs on http://localhost:5173):
npm run dev
```

---

## 🧪 Live Demonstration Scenario

1. **Explore Dashboard:** Open `http://localhost:5173` to see Arjun's live financial pulse (Income ₹88,000, Expenses, Savings rate, and Category donut chart).
2. **Simulate PayPal Payment:** Click **"Test PayPal Sandbox"** in the topbar. Enter an item (e.g. *"Bose QuietComfort 45 Headphones"*, ₹18,999 under *Shopping*).
3. **Automatic Synchronization:**
   - PayPal order created & captured via `/api/paypal`.
   - Transaction automatically logged in the PostgreSQL ledger.
   - Budget for Shopping dynamically debited.
   - AI Insight dispatched.
4. **Consult Multi-Agent AI Assistant:** Open **"AI Financial Assistant"** and click:
   - *"Can I afford a laptop worth ₹65,000?"*
   - *"Why did I overspend this month?"*
   - Watch the agent evaluate verified database records with deterministic tool verification badges.
5. **Explore What-If Forecast:** Open **"Financial Forecast"** and drag the reduction slider to see 12-month compound projections updated live.
6. **Generate Monthly Report:** Click **"Monthly report"** from Overview to view, share, or print/export a PDF.