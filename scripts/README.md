# Deployment Scripts

This directory contains scripts to help with production deployment to Render.com.

## 📁 Scripts Overview

### `deploy.sh`
**Main deployment script for Render.com**

```bash
# Show help and manual deployment instructions
./scripts/deploy.sh --help

# Verify deployment configuration
./scripts/deploy.sh --verify

# Deploy using Render CLI (requires setup)
./scripts/deploy.sh
```

**Features:**
- ✅ Validates configuration
- ✅ Checks git status
- ✅ Deploys via Render CLI or shows manual instructions
- ✅ Pre-deployment checklist

**On Windows (PowerShell):**
```powershell
bash scripts/deploy.sh --help
```

---

### `keep-alive.js`
**Keep server alive to prevent cold starts**

```bash
# Ping your server
node scripts/keep-alive.js https://your-api.onrender.com

# With npm script
npm run health-check
```

**Features:**
- ✅ Pings health endpoint
- ✅ Shows response time
- ✅ Displays server uptime
- ✅ Exit codes for automation

**Use Cases:**
- Test server health
- Local monitoring
- Manual keep-alive pings
- Testing before setting up cron

---

### `setup-keepalive-cron.sh`
**Interactive wizard for setting up keep-alive cron jobs**

```bash
./scripts/setup-keepalive-cron.sh
```

**Options:**
1. **GitHub Actions** - Free, runs in your repo
2. **cron-job.org** - Free external service (recommended)
3. **Render Cron Job** - Paid, requires Starter plan
4. **Test locally** - Test the keep-alive script

**On Windows:**
```powershell
bash scripts/setup-keepalive-cron.sh
```

---

## Quick Reference

### First Time Deployment

```bash
# 1. Verify everything is ready
./scripts/deploy.sh --verify

# 2. Follow manual deployment instructions
./scripts/deploy.sh --manual

# 3. After deployment, test health
node scripts/keep-alive.js https://your-api.onrender.com

# 4. Setup keep-alive cron
./scripts/setup-keepalive-cron.sh
```

### Regular Monitoring

```bash
# Check server health
node scripts/keep-alive.js https://your-api.onrender.com

# Watch health (Linux/Mac)
watch -n 5 'node scripts/keep-alive.js https://your-api.onrender.com'
```

---

## Environment Variables

Scripts may use these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Your backend URL | `https://platform-api.onrender.com` |
| `RENDER_EXTERNAL_URL` | Auto-set by Render | Used in health check |

---

## Troubleshooting

### Scripts Won't Run on Windows

**Issue:** Bash scripts don't work in PowerShell

**Solution 1:** Use Git Bash
```bash
# Open Git Bash and run
bash scripts/deploy.sh
```

**Solution 2:** Use WSL (Windows Subsystem for Linux)
```bash
wsl bash scripts/deploy.sh
```

**Solution 3:** Node scripts work everywhere
```bash
node scripts/keep-alive.js https://your-api.onrender.com
```

### Permission Denied

**On Linux/Mac:**
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

**On Windows:** Not needed, use `bash scripts/deploy.sh`

### Render CLI Not Found

```bash
# Install globally
npm install -g render

# Login
render login

# Verify installation
render --version
```

---

## Advanced Usage

### Automated Deployments

**GitHub Actions Example:**
```yaml
- name: Deploy to Render
  run: |
    npm install -g render
    render login --token ${{ secrets.RENDER_API_TOKEN }}
    render blueprint launch
```

**Cron Keep-Alive (cron-job.org):**
1. URL: `https://your-api.onrender.com/health`
2. Schedule: `*/10 * * * *` (every 10 minutes)
3. Method: GET
4. Timeout: 30 seconds

---

## Need Help?

- 📖 See [DEPLOYMENT.md](../DEPLOYMENT.md) for full guide
- 🚀 See [QUICKSTART.md](../QUICKSTART.md) for quick setup
- 🐛 Open an issue in your repository

---

## Script Maintenance

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add shebang: `#!/bin/bash` or `#!/usr/bin/env node`
3. Make executable: `chmod +x scripts/your-script.sh`
4. Document in this README
5. Test on multiple platforms (Linux, Mac, Windows)

### Testing Scripts

```bash
# Test deployment script (dry run)
./scripts/deploy.sh --verify

# Test keep-alive
node scripts/keep-alive.js https://platform-api.onrender.com

# Test cron setup (interactive)
./scripts/setup-keepalive-cron.sh
```

---

Happy Deploying! 🚀

