#!/bin/bash

###############################################################################
# Keep-Alive Setup Script
###############################################################################
# 
# This script helps you set up a keep-alive mechanism to prevent cold starts
# on Render.com free tier (which sleeps after 15 minutes of inactivity).
#
# Options:
# 1. GitHub Actions (free, runs in your repo)
# 2. cron-job.org (free external service)
# 3. Render Cron Job (requires paid plan)
#
# Usage:
#   ./scripts/setup-keepalive-cron.sh
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Option 1: GitHub Actions
setup_github_actions() {
    print_header "Setting Up GitHub Actions Keep-Alive"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/keep-alive.yml << 'EOF'
name: Keep Server Alive

on:
  schedule:
    # Run every 10 minutes (adjust as needed)
    # Cron format: minute hour day month day-of-week
    - cron: '*/10 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          echo "Pinging server..."
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.API_URL }}/health || echo "000")
          if [ "$response" = "200" ]; then
            echo "✅ Server is alive! (HTTP $response)"
          else
            echo "⚠️ Server returned HTTP $response"
            exit 0  # Don't fail the workflow
          fi
      
      - name: Display Server Info
        run: |
          curl -s ${{ secrets.API_URL }}/health || echo "Could not fetch server info"
EOF
    
    print_success "GitHub Actions workflow created: .github/workflows/keep-alive.yml"
    print_info "Next steps:"
    echo "  1. Add repository secret 'API_URL' in GitHub"
    echo "     - Go to: Repository → Settings → Secrets → Actions"
    echo "     - Add new secret: API_URL = https://your-api.onrender.com"
    echo "  2. Commit and push the workflow file"
    echo "  3. Check Actions tab in GitHub to verify it's running"
    echo ""
    print_warning "Note: GitHub Actions may be delayed, not guaranteed to run exactly every 10 minutes"
}

# Option 2: cron-job.org instructions
show_cronjob_org_instructions() {
    print_header "Setting Up cron-job.org Keep-Alive"
    
    cat << EOF
${GREEN}Steps:${NC}

1. Go to https://cron-job.org/ and create free account

2. Create new cron job:
   - Title: Keep Platform Alive
   - URL: https://your-api.onrender.com/health
   - Schedule: Every 10 minutes (or your preference)
   - Timezone: Your timezone

3. Configure notifications (optional):
   - Email on failure: Yes
   - Maximum failures before notification: 3

4. Save and enable the job

${GREEN}Advantages:${NC}
  ✅ More reliable than GitHub Actions
  ✅ Exact timing (runs precisely every X minutes)
  ✅ Email notifications on failures
  ✅ No code changes needed
  ✅ Easy to pause/resume

${YELLOW}Note:${NC}
  Free tier allows 50 monitoring jobs
  Can run as frequently as every minute

EOF
}

# Option 3: Render Cron Job
show_render_cron_instructions() {
    print_header "Setting Up Render Cron Job"
    
    cat << EOF
${YELLOW}⚠️  Requires Render Starter Plan or Higher${NC}

${GREEN}Steps:${NC}

1. Add to render.yaml:

   - type: cron
     name: keep-alive
     env: node
     schedule: "*/10 * * * *"  # Every 10 minutes
     buildCommand: echo "Keep alive"
     startCommand: curl \$RENDER_EXTERNAL_URL/health

2. Deploy to Render

${RED}Cost:${NC}
  - Cron jobs not available on free tier
  - Starter plan: \$7/month (includes cron jobs)

${GREEN}Alternative (Recommended for Free Tier):${NC}
  Use GitHub Actions or cron-job.org instead (both free)

EOF
}

# Option 4: Local testing
test_keepalive_script() {
    print_header "Testing Keep-Alive Script Locally"
    
    read -p "Enter your API URL (e.g., https://platform-api.onrender.com): " api_url
    
    if [ -z "$api_url" ]; then
        print_warning "No URL provided, using placeholder"
        api_url="https://platform-api.onrender.com"
    fi
    
    print_info "Testing keep-alive script..."
    node scripts/keep-alive.js "$api_url"
}

# Main menu
show_menu() {
    print_header "Keep-Alive Setup for Render.com"
    
    cat << EOF
Select an option:

  1) GitHub Actions (Free, runs in your repo)
  2) cron-job.org (Free, external service - RECOMMENDED)
  3) Render Cron Job (Paid, requires Starter plan)
  4) Test keep-alive script locally
  5) Show all options
  6) Exit

EOF
    
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            setup_github_actions
            ;;
        2)
            show_cronjob_org_instructions
            ;;
        3)
            show_render_cron_instructions
            ;;
        4)
            test_keepalive_script
            ;;
        5)
            setup_github_actions
            show_cronjob_org_instructions
            show_render_cron_instructions
            ;;
        6)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_warning "Invalid choice"
            show_menu
            ;;
    esac
}

# Run main menu
show_menu

