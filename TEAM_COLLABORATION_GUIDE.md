# FinSight AI — Teammate Onboarding & Collaboration Guide 🤝🚀

Welcome to the **FinSight AI** project team! This guide contains everything you need to clone, set up, run, test, and troubleshoot the full-stack platform without encountering errors.

---

## 1. System Architecture at a Glance

FinSight AI consists of three interconnected layers:

| Component | Directory | Port & URL | Primary Stack |
|---|---|---|---|
| **Frontend** | `frontend/` | `http://localhost:5173` | React 18, Pure JavaScript (JSX/JS), TailwindCSS, AG Grid, Recharts, Lucide |
| **Main Core Backend** | `backend/` | `http://localhost:5000` | Node.js (ESM), Express.js, Prisma ORM, PostgreSQL, PayPal Orders v2 |
| **AI Microservice** | `ai-integration/` | `http://localhost:8001` | Python 3.11, FastAPI, Groq LLM (LLaMA 3.3 70B), Scikit-learn, Pandas |
| **Interactive Docs** | `/docs` | `http://localhost:8001/docs` | Swagger UI for exploring and testing AI microservice APIs |

> **Single Source of Truth Rule:** PostgreSQL (managed by Prisma in the Node.js backend) is the primary source of truth. The FastAPI microservice reads financial records through internal authenticated REST calls and never maintains duplicate financial databases.

---

## 2. Prerequisites Checklist

Before starting, ensure you have the following installed on your machine:
- **Node.js:** v18 LTS or higher (v20 or v22 recommended) — [nodejs.org](https://nodejs.org)
- **Python:** 3.11 or higher — [python.org](https://python.org)
- **PostgreSQL:** Running locally on port `5432` (or a cloud PostgreSQL instance e.g., Supabase / Neon / Render) — [postgresql.org](https://www.postgresql.org)
- **Git:** Installed and configured — [git-scm.com](https://git-scm.com)

---

## 3. First-Time Setup (5 Minutes)

### Step 1: Clone the Repository
```bash
git clone https://github.com/sanchit-195/ai-financial-copilot.git
cd ai-financial-copilot
git checkout main
```

### Step 2: Install Dependencies for All 3 Tiers
Run this one command from the project root:
```bash
npm run setup:all
```
*(Or install manually in each folder: `cd backend && npm install`, `cd ../frontend && npm install`, `cd ../ai-integration && pip install -r requirements.txt`)*

### Step 3: Configure Environment Variables
Copy each example environment file:

```bash
# 1. Core Backend
cp backend/.env.example backend/.env

# 2. AI Integration Microservice
cp ai-integration/.env.example ai-integration/.env

# 3. Frontend
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and update your PostgreSQL password:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_financial_copilot?schema=public"
```

*(Optional: Add your free Groq API key in `ai-integration/.env` from [console.groq.com/keys](https://console.groq.com/keys). The app runs with intelligent fallbacks even without it).*

### Step 4: Initialize Database & Seed Demo Accounts
Run this one command from the project root:
```bash
npm run setup:db
```
This automatically pushes the Prisma schema to PostgreSQL and seeds the demo financial transactions, categories, budgets, and user accounts.

---

## 4. How to Run the Application

### Option A: One-Command Runner (Starts Everything)
From the project root:
```bash
npm start
# or
npm run dev
```
**Windows 1-Click shortcuts:**
- Command Prompt: `start-all.bat`
- PowerShell: `.\start-all.ps1`

This will boot all 3 tiers simultaneously with unified color-coded logs:
- `[FRONTEND]` `http://localhost:5173`
- `[BACKEND]` `http://localhost:5000`
- `[AI-FASTAPI]` `http://localhost:8001` (Auto-spawned & supervised by the backend!)

---

## 5. Pre-Seeded Demo Accounts for Testing

Use these credentials to log in on `http://localhost:5173`:

| Account Type | Email | Password | Role / Data |
|---|---|---|---|
| **Primary Financial User** | `demo@example.com` | `DemoPassword123!` | ₹90,000 income, 6 expenses, active budgets, PayPal ledger records |
| **Compliance & Auditor User** | `test_sec14@example.com` | `Password123!` | Complete device session history, security audit trail |

---

## 6. Running Automated Tests

Before submitting a Pull Request, run the test suites to ensure everything is green:

```bash
# Run all tests (Backend Vitest + Python Pytest):
npm test

# Run backend unit & integration tests only (21 tests):
npm run test:backend

# Run AI microservice tests only (22 tests):
npm run test:ai

# Test frontend production build (0 errors):
npm run build
```

---

## 7. Common Issues & Troubleshooting FAQ 🛠️

### Q1: "Port 5000 / 5173 / 8001 is already in use"
**Fix:** Another instance is running in the background. Kill the existing process:
- **Windows PowerShell:**
  ```powershell
  Get-Process -Name node, python -ErrorAction SilentlyContinue | Stop-Process -Force
  ```
- **macOS / Linux:**
  ```bash
  kill -9 $(lsof -ti:5000,5173,8001)
  ```

### Q2: "PrismaClientInitializationError: Can't reach database server at localhost:5432"
**Fix:**
1. Check if PostgreSQL service is running on your machine:
   - Windows: Check `services.msc` and start `postgresql-x64`.
   - macOS: `brew services start postgresql@15`
   - Linux: `sudo systemctl start postgresql`
2. Check your password in `backend/.env`:
   `DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_financial_copilot?schema=public"`
3. Re-run: `npm run setup:db`

### Q3: "Frontend build failed because of TypeScript / Types"
**Fix:** The frontend is **100% pure JavaScript (JSX/JS)**. We removed `tsc` from the frontend build. Run:
```bash
cd frontend && npm run build
```
It builds cleanly using Vite with zero TypeScript overhead.

### Q4: "FastAPI is not starting"
**Fix:**
Ensure your virtual environment or Python has the packages installed:
```bash
cd ai-integration
python -m pip install -r requirements.txt
```
The Node.js backend automatically detects and launches FastAPI on port `8001` when the backend starts.

### Q5: "PayPal sandbox payments fail"
**Fix:**
In sandbox mode, you can test without live keys using the pre-seeded simulation, or obtain free sandbox credentials from [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox) and set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env`.

---

## 8. Git Collaboration Guidelines

1. **Always pull before starting new work:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Work in feature branches:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Verify tests before committing:**
   ```bash
   npm test
   npm run build
   ```
4. **Push and open a PR against `main`:**
   ```bash
   git push origin feature/your-feature-name
   ```
