#!/bin/bash

###############################################################################
# Deployment Script for Render.com
###############################################################################
# 
# This script helps you deploy your application to Render.com.
# 
# Prerequisites:
# - Install Render CLI: npm install -g render
# - Login: render login
# - Connect your repository to Render dashboard first
# 
# Usage:
#   ./scripts/deploy.sh               # Deploy using render.yaml
#   ./scripts/deploy.sh --help        # Show help
#   ./scripts/deploy.sh --verify      # Verify deployment configuration
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if render CLI is installed
check_render_cli() {
    if ! command -v render &> /dev/null; then
        print_error "Render CLI not found!"
        print_info "Install it with: npm install -g render"
        print_info "Then login with: render login"
        exit 1
    fi
    print_success "Render CLI found"
}

# Verify render.yaml exists
check_render_yaml() {
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found in project root!"
        exit 1
    fi
    print_success "render.yaml found"
}

# Verify environment files
verify_env_files() {
    print_info "Checking environment configuration..."
    
    if [ ! -f "server/env.example" ]; then
        print_warning "server/env.example not found"
    else
        print_success "server/env.example exists"
    fi
    
    if [ ! -f "client/env.example" ]; then
        print_warning "client/env.example not found"
    else
        print_success "client/env.example exists"
    fi
}

# Show deployment checklist
show_checklist() {
    print_header "Pre-Deployment Checklist"
    
    cat << EOF
Before deploying, ensure you have:

Server (.env):
  [ ] NODE_ENV=production
  [ ] DATABASE_URL (auto-provided by Render)
  [ ] JWT_SECRET (generate secure secret)
  [ ] CLIENT_URL (frontend URL after deployment)

Client (.env):
  [ ] VITE_API_URL (backend URL)

Render Configuration:
  [ ] Repository connected to Render dashboard
  [ ] Database created and connected
  [ ] Environment variables configured
  [ ] Build and start commands verified

Git:
  [ ] All changes committed
  [ ] Pushed to main/master branch
  [ ] No uncommitted changes

EOF
}

# Verify git status
check_git_status() {
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes!"
        print_info "Commit your changes before deploying"
        git status --short
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "No uncommitted changes"
    fi
}

# Deploy using render.yaml
deploy_with_yaml() {
    print_header "Deploying to Render"
    
    print_info "Validating render.yaml..."
    if render blueprint validate; then
        print_success "render.yaml is valid"
    else
        print_error "render.yaml validation failed"
        exit 1
    fi
    
    print_info "Deploying services..."
    print_warning "Note: First deployment via CLI requires manual approval in Render dashboard"
    print_info "Visit: https://dashboard.render.com/blueprints"
    
    render blueprint launch
    
    print_success "Deployment initiated!"
    print_info "Monitor progress: https://dashboard.render.com/"
}

# Manual deployment instructions
show_manual_instructions() {
    print_header "Manual Deployment Instructions"
    
    cat << EOF
${GREEN}Option 1: Dashboard Deployment (Recommended)${NC}
  1. Push code to GitHub/GitLab
  2. Go to https://dashboard.render.com/
  3. Click "New +" → "Blueprint"
  4. Connect your repository
  5. Render will detect render.yaml automatically
  6. Review and approve the blueprint
  7. Services will be created and deployed

${GREEN}Option 2: Individual Service Deployment${NC}
  1. Push code to GitHub/GitLab
  2. Create PostgreSQL database:
     - Dashboard → New → PostgreSQL
     - Name: platform-db, Plan: Free
  3. Create Backend service:
     - Dashboard → New → Web Service
     - Connect repository
     - Root directory: server
     - Build: npm install && npm run build && npm run migrate:prod
     - Start: npm start
     - Add environment variables from server/env.example
  4. Create Frontend service:
     - Dashboard → New → Static Site
     - Connect repository
     - Root directory: client
     - Build: npm install && npm run build
     - Publish: dist
     - Add rewrite rule: /* → /index.html
     - Add environment variables from client/env.example

${GREEN}Option 3: CLI Deployment${NC}
  1. Install Render CLI: npm install -g render
  2. Login: render login
  3. Deploy: render blueprint launch
  4. Approve in dashboard

${YELLOW}After Deployment:${NC}
  1. Copy backend URL and update CLIENT_URL in backend env vars
  2. Copy frontend URL and update VITE_API_URL in frontend env vars
  3. Redeploy services to apply updated environment variables
  4. Test health endpoint: curl https://your-api.onrender.com/health
  5. Setup keep-alive (see scripts/setup-keepalive-cron.sh)

EOF
}

# Main script
main() {
    case "${1:-}" in
        --help|-h)
            show_manual_instructions
            ;;
        --verify)
            print_header "Verifying Deployment Configuration"
            check_render_yaml
            verify_env_files
            check_git_status
            show_checklist
            ;;
        --manual)
            show_manual_instructions
            ;;
        *)
            print_header "Render.com Deployment"
            print_info "Starting deployment process..."
            
            check_render_yaml
            verify_env_files
            check_git_status
            
            print_warning "\n⚠️  Important: First-time deployment?"
            print_info "For first deployment, use manual dashboard deployment"
            print_info "Run: ./scripts/deploy.sh --manual"
            echo
            
            read -p "Continue with CLI deployment? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                check_render_cli
                deploy_with_yaml
            else
                print_info "Showing manual deployment instructions instead..."
                show_manual_instructions
            fi
            ;;
    esac
}

main "$@"

