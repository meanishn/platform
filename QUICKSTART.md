# 🚀 Quick Start: Deploy to Production

**Time to deploy:** 15-30 minutes

## Prerequisites Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Render.com account created (free)
- [ ] All changes committed

## Step-by-Step

### 1. Prepare Environment Variables

```bash
# Copy templates
cp server/env.example server/.env
cp client/env.example client/.env
```

**Required Values:**

**Server `.env`:**
```bash
NODE_ENV=production
DATABASE_URL=  # Auto-provided by Render
JWT_SECRET=    # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CLIENT_URL=    # Add after frontend deployment
```

**Client `.env`:**
```bash
VITE_API_URL=  # Add after backend deployment
```

### 2. Deploy via Render Dashboard

#### A. Go to [Render Dashboard](https://dashboard.render.com/)

#### B. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `platform-db`
3. Plan: **Free**
4. Click "Create"
5. Copy "Internal Database URL"

#### C. Create Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `platform-api`
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build && npm run migrate:prod`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=[paste from step B.5]
   JWT_SECRET=[generate using command above]
   CLIENT_URL=[add after step D]
   ```
5. Advanced → Health Check Path: `/health`
6. Click "Create Web Service"
7. **Copy backend URL** (e.g., `https://platform-api.onrender.com`)

#### D. Create Frontend Service
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name:** `platform-app`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=[paste backend URL from step C.7]
   ```
5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
6. Click "Create Static Site"
7. **Copy frontend URL** (e.g., `https://platform-app.onrender.com`)

#### E. Update Backend CORS
1. Go to backend service (`platform-api`)
2. Environment tab
3. Update `CLIENT_URL` = [frontend URL from step D.7]
4. Save (triggers automatic redeploy)

### 3. Verify Deployment

```bash
# Test backend health
curl https://your-api.onrender.com/health

# Test keep-alive script
node scripts/keep-alive.js https://your-api.onrender.com

# Open frontend
# Visit: https://your-app.onrender.com
```

### 4. Setup Keep-Alive (Prevent Cold Starts)

**Option A: cron-job.org (Recommended - 2 minutes)**
1. Go to [cron-job.org](https://cron-job.org/)
2. Create account
3. Add job: `https://your-api.onrender.com/health`
4. Schedule: Every 10 minutes
5. Done! ✅

**Option B: Use Setup Script**
```bash
# On Mac/Linux
bash scripts/setup-keepalive-cron.sh

# On Windows
node scripts/keep-alive.js https://your-api.onrender.com
```

## Common Issues

### Build Fails
- Check logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure `tsconfig.json` is committed

### Database Connection Error
- Verify DATABASE_URL is copied correctly
- Check database is "Available" in dashboard
- Ensure SSL is enabled (already configured)

### CORS Error
- Update `CLIENT_URL` in backend environment
- Don't include trailing slash
- Exact match required

### Frontend Shows "API Error"
- Check `VITE_API_URL` is set correctly
- Must include `https://` protocol
- Verify backend is deployed and healthy

## Next Steps

- ✅ Test all features (login, create requests, etc.)
- ✅ Monitor logs for errors
- ✅ Set up keep-alive to prevent cold starts
- ✅ Share with users! 🎉

## Need More Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

**Total Cost:** Free for 90 days, then $7/month for database

