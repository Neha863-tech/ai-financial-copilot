# FinSight AI — Render Cloud Deployment Guide 🌐🚀

This guide provides the complete walkthrough to deploy the entire **FinSight AI** full-stack platform (PostgreSQL Database, Node.js Backend, Python FastAPI AI Microservice, and React Frontend) onto [Render](https://render.com).

---

## ⚡ Method 1: One-Click Blueprint Deployment (Recommended)

The repository includes an Infrastructure-as-Code [render.yaml](./render.yaml) specification that automatically provisions and connects all four components together.

### Step-by-Step Instructions:

1. **Log in to Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Sign in with your GitHub account.

2. **Create New Blueprint Instance:**
   - In the top-right corner, click **New +** and select **Blueprint**.
   - Connect your GitHub repository:
     `https://github.com/sanchit-195/ai-financial-copilot`
   - Select the **`main`** branch.

3. **Render Automatically Provisions 4 Components:**
   Render will inspect `render.yaml` and show the deployment plan:
   - 🐘 **Database:** `finsight-db` (PostgreSQL managed instance)
   - 🟢 **Backend Web Service:** `finsight-backend` (Node.js + Express + Prisma)
   - 🐍 **AI Microservice:** `finsight-ai-service` (Python FastAPI + Groq LLM)
   - ⚛️ **Frontend Static Site:** `finsight-frontend` (React 18 + Vite SPA)

4. **Fill in Environment Variables (Optional Secrets):**
   Render will prompt you for any keys marked without defaults:
   - `GROQ_API_KEY`: *(Optional)* Your Groq API key from [console.groq.com/keys](https://console.groq.com/keys).
   - `PAYPAL_CLIENT_ID`: *(Optional)* Your sandbox client ID from [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox).
   - `PAYPAL_CLIENT_SECRET`: *(Optional)* Your sandbox secret.
   *(All internal networking, database URLs, and API keys are automatically generated and linked).*

5. **Click "Apply":**
   Render will deploy the database, run migrations, seed the demo accounts, start the microservices, and build the frontend.

---

## 🛠️ Method 2: Manual Dashboard Deployment (Step-by-Step)

If you prefer to configure each service manually in the Render dashboard:

### 1. Create Managed PostgreSQL Database
- Click **New +** &rarr; **PostgreSQL**.
- **Name:** `finsight-db`
- **Database:** `ai_financial_copilot`
- **User:** `finsight_user`
- **Plan:** Free
- Copy the **Internal Database URL** once created.

---

### 2. Deploy Python FastAPI AI Microservice
- Click **New +** &rarr; **Web Service**.
- Connect your GitHub repository.
- **Name:** `finsight-ai-service`
- **Root Directory:** `ai-integration`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `AI_SERVICE_ENV`: `production`
  - `NODE_BACKEND_URL`: `https://finsight-backend.onrender.com` (your backend URL)
  - `AI_SERVICE_API_KEY`: `finsight_internal_ai_secret_key_2026`
  - `GROQ_API_KEY`: your-groq-api-key
  - `GROQ_MODEL`: `llama-3.3-70b-versatile`

---

### 3. Deploy Node.js Express Core Backend
- Click **New +** &rarr; **Web Service**.
- Connect your GitHub repository.
- **Name:** `finsight-backend`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`  
  *(Runs `prisma generate && prisma db push && node prisma/seed.js`)*
- **Start Command:** `npm start`
- **Health Check Path:** `/api/v1/health`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `[Internal Database URL from Step 1]`
  - `JWT_SECRET`: `[Any random 32+ character string]`
  - `JWT_EXPIRES_IN`: `7d`
  - `AI_SERVICE_URL`: `https://finsight-ai-service.onrender.com`
  - `AI_SERVICE_API_KEY`: `finsight_internal_ai_secret_key_2026`
  - `FRONTEND_URL`: `https://finsight-frontend.onrender.com`
  - `PAYPAL_ENV`: `sandbox`
  - `PAYPAL_CURRENCY`: `USD`

---

### 4. Deploy React Vite Frontend
- Click **New +** &rarr; **Static Site**.
- Connect your GitHub repository.
- **Name:** `finsight-frontend`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://finsight-backend.onrender.com/api/v1`
- **Redirects / Rewrites:**
  - In Settings &rarr; **Redirects/Rewrites**:
  - Add Rule: `/*` &rarr; `/index.html` (Rewrite) to support client-side routing.

---

## 🎯 Verification & Testing

Once deployed:
1. Open your live frontend URL: `https://finsight-frontend.onrender.com`
2. Log in with the pre-seeded demo account:
   - **Email:** `demo@example.com`
   - **Password:** `DemoPassword123!`
3. Verify that your transactions, charts, and AI Copilot responses load live from PostgreSQL!
