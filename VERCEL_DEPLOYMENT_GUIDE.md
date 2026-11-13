# FinSight AI Copilot — Vercel Deployment Guide

This guide explains how to deploy the **FinSight AI Copilot** frontend to [Vercel](https://vercel.com) for lightning-fast global edge delivery, automatic SSL certificates, and continuous CI/CD on every Git push.

---

## 🏗️ Architecture Overview

FinSight AI is built with a decoupled 3-tier architecture:

```
┌─────────────────────────────────┐
│   Vercel Global Edge (CDN)     │
│   React 18 + Vite (SPA)         │
│   https://finsight.vercel.app   │
└────────────────┬────────────────┘
                 │
                 │ HTTPS API Calls (VITE_API_BASE_URL)
                 ▼
┌─────────────────────────────────┐
│   Render / Cloud Backend        │
│   Node.js Express + Prisma ORM  │
│   PostgreSQL Database           │
└────────────────┬────────────────┘
                 │
                 │ Internal HTTP / Proxy
                 ▼
┌─────────────────────────────────┐
│   FastAPI AI Microservice       │
│   Python + CrewAI + LangChain   │
└─────────────────────────────────┘
```

> **Why Deploy the Frontend to Vercel?**
> - **Zero Cold Starts**: Served directly from Vercel's global CDN in milliseconds.
> - **Automated Preview URLs**: Every branch and Pull Request automatically gets a preview URL.
> - **Graceful Offline Fallback**: If the backend is ever spinning up or undergoing maintenance, the frontend automatically falls back to interactive mock demo data without crashing.

---

## 🚀 Method 1: Deploy via Vercel Web Dashboard (Recommended — 2 Minutes)

### Step 1: Open Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Sign in with your GitHub account.

### Step 2: Import Your Repository
1. In the "Import Git Repository" section, search for:
   - `sanchit-195/ai-financial-copilot` *(or `Neha863-tech/ai-financial-copilot`)*
2. Click **Import**.

### Step 3: Configure Project Settings
In the configuration screen:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Project Name** | `finsight-ai-copilot` | Or your preferred name |
| **Framework Preset** | `Vite` | Auto-detected |
| **Root Directory** | `frontend` | Click **Edit** next to Root Directory and choose `frontend` |
| **Build Command** | `npm run build` | Default |
| **Output Directory** | `dist` | Default |

*(Note: Even if you keep Root Directory as `/`, the root `vercel.json` is preconfigured to build `frontend` automatically!)*

### Step 4: Add Environment Variables
Expand the **Environment Variables** section and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://finsight-backend-xxxx.onrender.com/api/v1` | URL of your deployed backend service on Render/Railway |
| `VITE_ENABLE_MOCK_FALLBACK` | `true` | Allows previewing full demo data when backend is sleeping |

### Step 5: Deploy
Click **Deploy**.
Vercel will build the frontend in ~15 seconds and provide a live URL like:
`https://finsight-ai-copilot.vercel.app`

---

## 💻 Method 2: Deploy via Vercel CLI

If you prefer deploying from your terminal:

```powershell
# 1. Log in to your Vercel account
npx vercel login

# 2. Navigate to the frontend directory
cd frontend

# 3. Deploy to production
npx vercel --prod
```

During the CLI wizard:
- `Set up and deploy?` &rarr; `Y`
- `Which scope?` &rarr; Select your personal account
- `Link to existing project?` &rarr; `N`
- `What's your project's name?` &rarr; `finsight-ai-copilot`
- `In which directory is your code located?` &rarr; `./`
- `Want to modify these settings?` &rarr; `N`

---

## 🛠️ Included Vercel Configurations

The repository includes pre-tested Vercel configuration files:

1. **`frontend/vercel.json`**:
   - Configures SPA client-side routing rewrites so URLs like `/dashboard`, `/analytics`, `/agents`, and `/auth` refresh without returning `404 Not Found`.
   - Sets immutable caching headers on static assets (`/assets/*`) for maximum Lighthouse performance.
2. **`vercel.json` (Root)**:
   - Fallback configuration that allows 1-click deployment even if the user does not change the Root Directory in the Vercel UI.
3. **`.vercelignore`**:
   - Excludes backend and Python AI folders during the frontend deployment bundle upload.
4. **Backend CORS Compatibility**:
   - `backend/src/app.js` is pre-configured to accept requests from any `*.vercel.app` domain, eliminating CORS errors on preview or production links.

---

## 🔗 Connecting Frontend & Backend

Once your backend is live (e.g. on Render):
1. In Vercel, navigate to **Project Settings &rarr; Environment Variables**.
2. Set or update:
   ```
   VITE_API_BASE_URL = https://your-backend-service.onrender.com/api/v1
   ```
3. Trigger a redeploy by clicking **Deployments &rarr; Redeploy**.
4. FinSight AI is now running globally with live data!
