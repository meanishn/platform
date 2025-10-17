# ✅ Deployment Checklist

Print or reference this checklist during deployment.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to git
- [ ] All changes pushed to GitHub/GitLab
- [ ] No uncommitted changes (`git status` clean)
- [ ] Tests passing (if applicable)
- [ ] Environment files configured (`server/env.example`, `client/env.example`)

### Accounts & Access
- [ ] Render.com account created
- [ ] GitHub repository accessible
- [ ] Repository connected to Render (if using dashboard)
- [ ] Render CLI installed (if using CLI deployment)

---

## Environment Variables Prepared

### Server (.env)
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `DATABASE_URL` (will be auto-provided by Render)
- [ ] `JWT_SECRET` (generated: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `CLIENT_URL` (will add after frontend deploys)

### Client (.env)
- [ ] `VITE_API_URL` (will add after backend deploys)

---

## Deployment Steps

### 1. Database Setup
- [ ] PostgreSQL database created on Render
- [ ] Database name: `platform-db`
- [ ] Plan: Free (or paid)
- [ ] Database is "Available" status
- [ ] Internal Database URL copied

### 2. Backend Deployment
- [ ] Web Service created
- [ ] Name: `platform-api`
- [ ] Root directory: `server`
- [ ] Build command: `npm install && npm run build && npm run migrate:prod`
- [ ] Start command: `npm start`
- [ ] Plan: Free (or paid)
- [ ] Environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=4000`
  - [ ] `DATABASE_URL` (pasted from database)
  - [ ] `JWT_SECRET` (generated secure string)
- [ ] Health check path: `/health`
- [ ] Auto-deploy enabled
- [ ] Service deployed successfully
- [ ] Backend URL copied (e.g., `https://platform-api.onrender.com`)

### 3. Frontend Deployment
- [ ] Static Site created
- [ ] Name: `platform-app`
- [ ] Root directory: `client`
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variable added:
  - [ ] `VITE_API_URL` (backend URL from step 2)
- [ ] Rewrite rule added: `/*` → `/index.html`
- [ ] Auto-deploy enabled
- [ ] Service deployed successfully
- [ ] Frontend URL copied (e.g., `https://platform-app.onrender.com`)

### 4. Update Backend CORS
- [ ] Backend service settings opened
- [ ] Environment tab accessed
- [ ] `CLIENT_URL` updated with frontend URL
- [ ] Changes saved
- [ ] Service redeployed automatically
- [ ] Redeployment completed successfully

---

## Post-Deployment Verification

### Health Checks
- [ ] Backend health endpoint responds: `curl https://your-api.onrender.com/health`
- [ ] Frontend loads in browser
- [ ] No console errors in browser DevTools
- [ ] No CORS errors in browser console

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] User registration works
- [ ] Login authentication works
- [ ] Dashboard loads after login
- [ ] API requests working (check Network tab)
- [ ] Database queries working
- [ ] All user roles accessible:
  - [ ] Customer dashboard
  - [ ] Provider dashboard
  - [ ] Admin dashboard (if applicable)

### Database
- [ ] Migrations applied successfully (check backend logs)
- [ ] Seed data loaded (if applicable)
- [ ] Database connections stable
- [ ] No connection errors in logs

### WebSocket (if implemented)
- [ ] WebSocket connections established
- [ ] Real-time updates working
- [ ] No WebSocket errors in console

---

## Keep-Alive Setup (Prevent Cold Starts)

### Option 1: cron-job.org (Recommended)
- [ ] Account created at cron-job.org
- [ ] Cron job added
- [ ] URL: `https://your-api.onrender.com/health`
- [ ] Schedule: Every 10 minutes
- [ ] Job enabled
- [ ] First ping successful

### Option 2: GitHub Actions
- [ ] Workflow file created: `.github/workflows/keep-alive.yml`
- [ ] Secret added: `API_URL`
- [ ] Workflow committed and pushed
- [ ] First run successful (check Actions tab)

### Option 3: UptimeRobot
- [ ] Account created
- [ ] Monitor added for health endpoint
- [ ] Interval: 5 minutes (free tier)
- [ ] Monitor active

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] No secrets in git repository
- [ ] `.env` files in `.gitignore`
- [ ] DATABASE_URL uses SSL (already configured)
- [ ] CORS only allows trusted domains
- [ ] Environment variables secure in Render dashboard
- [ ] Google OAuth credentials secure (if using)

---

## Monitoring & Maintenance

### Setup Monitoring
- [ ] Render dashboard bookmarked
- [ ] Email notifications enabled in Render
- [ ] Keep-alive service running
- [ ] Health check monitoring active

### Documentation
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented for team
- [ ] Troubleshooting steps documented

### Logs
- [ ] Backend logs reviewed (no errors)
- [ ] Frontend build logs reviewed
- [ ] Database logs checked
- [ ] Deployment logs saved

---

## Cost Tracking

- [ ] Current plan documented:
  - Backend: Free / Paid ($___/month)
  - Frontend: Free
  - Database: Free (90 days) / Paid ($7/month)
- [ ] Billing alerts set up (if paid)
- [ ] Free tier limitations understood:
  - 750 hours/month
  - Sleeps after 15 minutes
  - 100GB bandwidth/month

---

## Rollback Plan

In case of issues:
- [ ] Previous working commit ID documented: `_________________`
- [ ] Rollback procedure understood:
  1. Go to service in Render dashboard
  2. Click "Events" tab
  3. Click "Redeploy" on previous deployment
- [ ] Database backup available (if paid plan)
- [ ] Contact information for support ready

---

## Final Steps

- [ ] Share URLs with team
- [ ] Update README with production URLs
- [ ] Notify stakeholders deployment is complete
- [ ] Schedule post-deployment review
- [ ] Celebrate! 🎉

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check logs, verify dependencies in `package.json` |
| CORS error | Update `CLIENT_URL` in backend environment |
| 502 Bad Gateway | Check backend logs, verify start command |
| Database connection error | Verify DATABASE_URL, check SSL configuration |
| Frontend shows blank page | Check browser console, verify `VITE_API_URL` |
| Cold start too slow | Set up keep-alive service |

---

## Support Resources

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🚀 [Quick Start Guide](./QUICKSTART.md)
- 🔧 [Scripts Documentation](./scripts/README.md)
- 💬 [Render Community](https://community.render.com/)
- 📧 Render Support: support@render.com

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Backend URL:** _______________

**Frontend URL:** _______________

**Notes:** 
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

