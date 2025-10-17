# 🚀 Deployment Guide

Complete guide for deploying your platform to production using Render.com.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Keep-Alive Setup](#keep-alive-setup)
- [Troubleshooting](#troubleshooting)
- [Cost Breakdown](#cost-breakdown)

---

## Prerequisites

✅ **Before deploying, ensure you have:**

- Git repository (GitHub, GitLab, or Bitbucket)
- Render.com account (free tier available)
- All code committed and pushed to repository
- Environment variables prepared (see [Environment Variables](#environment-variables))

---

## Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Verify configuration
./scripts/deploy.sh --verify

# 2. View deployment instructions
./scripts/deploy.sh --manual

# 3. Deploy (requires Render CLI)
./scripts/deploy.sh
```

### Option 2: Dashboard Deployment (Easiest for First Time)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render automatically detects `render.yaml`
6. Review and approve services
7. Wait for deployment to complete

---

## Deployment Options

### 🎯 Render.com (Recommended)

**Best for:** Full-stack apps with real-time features

**Pros:**
- ✅ Free tier available (with limitations)
- ✅ PostgreSQL included
- ✅ WebSocket support
- ✅ Simple infrastructure-as-code (`render.yaml`)
- ✅ Automatic SSL certificates
- ✅ GitHub integration

**Cons:**
- ⚠️ Free tier: 750 hours/month, sleeps after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds on first request
- ⚠️ Database: Free for 90 days, then $7/month

### 🚂 Railway.app

**Best for:** Better performance, avoid cold starts

**Pros:**
- ✅ $5 free credit monthly
- ✅ No forced sleep
- ✅ Better developer experience
- ✅ Faster than Render free tier

**Cons:**
- ⚠️ Credit runs out with heavy usage
- ⚠️ Requires payment method after trial

---

## Step-by-Step Deployment

### 1️⃣ Prepare Environment Variables

Create `.env` files from templates:

```bash
# Server
cp server/env.example server/.env

# Client  
cp client/env.example client/.env
```

Edit the files with your values (see [Environment Variables](#environment-variables)).

### 2️⃣ Update render.yaml

Edit `render.yaml` and update these values:

```yaml
# Line 6: Choose your region
region: oregon  # Options: oregon, frankfurt, ohio, singapore

# Line 26: Update after frontend is deployed
- key: CLIENT_URL
  value: https://your-frontend-url.onrender.com

# Line 44: Update after backend is deployed
- key: VITE_API_URL
  value: https://your-backend-url.onrender.com
```

### 3️⃣ Deploy via Dashboard

**A. Create Database:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configuration:
   - Name: `platform-db`
   - Database: `platform`
   - User: `platform_user`
   - Region: Same as your services
   - Plan: **Free**
4. Click "Create Database"
5. Wait for provisioning (2-3 minutes)
6. Copy the "Internal Database URL"

**B. Create Backend Service:**

1. Click "New +" → "Web Service"
2. Connect your repository
3. Configuration:
   - Name: `platform-api`
   - Root Directory: `server`
   - Environment: `Node`
   - Region: Same as database
   - Branch: `main` or `master`
   - Build Command: `npm install && npm run build && npm run migrate:prod`
   - Start Command: `npm start`
   - Plan: **Free**
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=[paste internal DB URL]
   JWT_SECRET=[generate random string]
   CLIENT_URL=[will add after frontend deploy]
   ```
5. Advanced Settings:
   - Health Check Path: `/health`
   - Auto-Deploy: Yes
6. Click "Create Web Service"
7. **Copy the backend URL** (e.g., `https://platform-api.onrender.com`)

**C. Create Frontend Service:**

1. Click "New +" → "Static Site"
2. Connect same repository
3. Configuration:
   - Name: `platform-app`
   - Root Directory: `client`
   - Branch: `main` or `master`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=[paste backend URL from step B.7]
   ```
5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**
6. Click "Create Static Site"
7. **Copy the frontend URL** (e.g., `https://platform-app.onrender.com`)

**D. Update Backend Environment:**

1. Go back to backend service (`platform-api`)
2. Click "Environment" tab
3. Update `CLIENT_URL` with frontend URL from step C.7
4. Click "Save Changes"
5. Service will redeploy automatically

### 4️⃣ Verify Deployment

```bash
# Test health endpoint
curl https://your-api.onrender.com/health

# Test keep-alive script
node scripts/keep-alive.js https://your-api.onrender.com

# Test frontend
open https://your-app.onrender.com
```

---

## Environment Variables

### Server (Backend)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `4000` |
| `DATABASE_URL` | ✅ | PostgreSQL connection | Auto-provided by Render |
| `JWT_SECRET` | ✅ | JWT signing secret | Generate with crypto |
| `CLIENT_URL` | ✅ | Frontend URL (CORS) | `https://app.onrender.com` |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth (optional) | - |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth (optional) | - |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client (Frontend)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API URL | `https://api.onrender.com` |

---

## Post-Deployment

### ✅ Deployment Checklist

After deployment, verify:

- [ ] Health endpoint returns 200: `curl https://your-api.onrender.com/health`
- [ ] Frontend loads without errors
- [ ] Login/authentication works
- [ ] Database migrations applied successfully
- [ ] Seed data loaded (if applicable)
- [ ] WebSocket connections work (check browser console)
- [ ] All user roles accessible (customer, provider, admin)
- [ ] CORS configured correctly (no CORS errors in console)

### 🔒 Security Checklist

- [ ] Strong JWT_SECRET in production (32+ characters)
- [ ] DATABASE_URL uses SSL connection
- [ ] CORS only allows your frontend domain
- [ ] No secrets committed to git
- [ ] Environment variables secure in Render dashboard

### 📊 Monitoring

**Render Dashboard:**
- Monitor logs: Service → Logs tab
- Check metrics: Service → Metrics tab
- View deployments: Service → Events tab

**Health Monitoring:**
```bash
# Check server health
curl https://your-api.onrender.com/health

# Monitor with watch (Linux/Mac)
watch -n 5 'curl -s https://your-api.onrender.com/health | jq'
```

---

## Keep-Alive Setup

Prevent cold starts on Render free tier by pinging your server regularly.

### Quick Setup

```bash
# Interactive setup wizard
./scripts/setup-keepalive-cron.sh
```

### Option 1: cron-job.org (Recommended)

**Why:** Most reliable, exact timing, email notifications

1. Go to [cron-job.org](https://cron-job.org/)
2. Create free account
3. Add new cron job:
   - **URL:** `https://your-api.onrender.com/health`
   - **Schedule:** Every 10 minutes
   - **Timeout:** 30 seconds
   - **Enable:** Notification on failure
4. Save and enable

**Result:** Server stays awake 24/7, no cold starts! 🎉

### Option 2: GitHub Actions

**Why:** Free, no external service, runs in your repo

1. Create `.github/workflows/keep-alive.yml`:
   ```yaml
   name: Keep Server Alive
   on:
     schedule:
       - cron: '*/10 * * * *'  # Every 10 minutes
     workflow_dispatch:
   
   jobs:
     ping:
       runs-on: ubuntu-latest
       steps:
         - name: Ping Health Endpoint
           run: |
             curl -s ${{ secrets.API_URL }}/health || exit 0
   ```

2. Add GitHub secret:
   - Go to: Repository → Settings → Secrets → Actions
   - Add: `API_URL` = `https://your-api.onrender.com`

3. Commit and push workflow file

**Note:** GitHub Actions timing not guaranteed, may have delays.

### Option 3: UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com/)
2. Create free account (50 monitors free)
3. Add new monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-api.onrender.com/health`
   - **Interval:** 5 minutes (free tier minimum)
4. Enable email alerts

---

## Troubleshooting

### ❌ Build Fails: "Cannot find module"

**Cause:** Missing dependencies

**Fix:**
```bash
cd server  # or client
npm install
# Check package.json and package-lock.json are committed
```

### ❌ Client Build Error: "Cannot find module 'objection'"

**Cause:** TypeScript trying to compile server files during client build

**Error message:**
```
../server/src/models/User.ts(1,23): error TS2307: Cannot find module 'objection'
```

**Fix:**
This has been fixed in the repository. The client's `package.json` now uses `vite build` instead of `tsc -b && vite build`.

If you still see this error:
1. Pull the latest changes from the repository
2. Or manually update `client/package.json`:
   ```json
   "build": "vite build"
   ```
3. Redeploy the service

**Why this happened:** The `tsc -b` command uses TypeScript project references and was discovering the parent directory's server code.

### ❌ Database Connection Error

**Cause:** Wrong DATABASE_URL or SSL issue

**Fix:**
1. Verify DATABASE_URL in environment variables
2. Ensure SSL is enabled in production knexfile
3. Check database is in same region as service
4. Verify database is "Available" status in dashboard

### ❌ CORS Error in Browser

**Cause:** CLIENT_URL not configured or wrong

**Fix:**
1. Go to backend service → Environment
2. Set `CLIENT_URL` to exact frontend URL
3. Don't include trailing slash
4. Allow multiple origins: `https://app1.com,https://app2.com`

### ❌ "502 Bad Gateway"

**Cause:** Server crashed or not starting

**Fix:**
1. Check backend logs in dashboard
2. Verify build command succeeded
3. Check start command is correct: `npm start`
4. Ensure `dist/server.js` exists after build

### ❌ Cold Start Takes Too Long

**Cause:** Free tier sleeps after 15 minutes

**Fix:**
- Set up keep-alive (see [Keep-Alive Setup](#keep-alive-setup))
- Or upgrade to paid plan ($7/month, no sleep)

### ❌ Migration Fails

**Cause:** Database not ready or wrong environment

**Fix:**
```bash
# Check build command includes migration
npm install && npm run build && npm run migrate:prod

# Verify NODE_ENV=production
# Migrations should run automatically on deploy
```

### 🔍 Debug Logs

View detailed logs in Render dashboard:

1. Go to your service
2. Click "Logs" tab
3. Filter by "Deploy" or "Runtime"
4. Look for error messages

---

## Cost Breakdown

### Free Tier (Render.com)

| Service | Cost | Limitations |
|---------|------|-------------|
| Backend | Free | 750 hrs/month, sleeps after 15min |
| Frontend | Free | Unlimited bandwidth |
| PostgreSQL | Free | 90 days, then $7/month |
| **Total** | **$0** | Then $7/month after 90 days |

**Good for:** Demos, personal projects, MVPs

### Starter Plan

| Service | Cost | Benefits |
|---------|------|----------|
| Backend | $7/month | No sleep, better resources |
| Frontend | Free | Unlimited |
| PostgreSQL | $7/month | 1GB storage, daily backups |
| **Total** | **$14/month** | Production-ready |

**Good for:** Production apps, small businesses

### Alternative: Railway.app

| Service | Cost | Benefits |
|---------|------|----------|
| All services | $5 free | Then $0.01/min compute |
| | credit/month | No forced sleep |

---

## Advanced: CLI Deployment

Install Render CLI for faster deployments:

```bash
# Install
npm install -g render

# Login
render login

# Validate configuration
render blueprint validate

# Deploy
render blueprint launch

# Update service
render deploy <service-id>
```

---

## Need Help?

- 📖 [Render Documentation](https://render.com/docs)
- 💬 [Render Community](https://community.render.com/)
- 🐛 Report issues in your repository

---

## Summary

**Quickest Path to Production:**

1. ✅ Push code to GitHub
2. ✅ Deploy via Render Dashboard using `render.yaml`
3. ✅ Update environment variables
4. ✅ Set up keep-alive with cron-job.org
5. ✅ Monitor and test

**Total Time:** 15-30 minutes for first deployment

**Cost:** $0 for first 90 days, then $7/month for database

---

Good luck with your deployment! 🚀

