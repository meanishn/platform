# Migration Cleanup & Fresh Start Guide

## ✅ What Was Cleaned Up

I've removed all obsolete files related to the old proposal-based system:

### Deleted Migration Files
- ❌ `20240726_add_proposal_foreign_key.ts` - Caused migration error
- ❌ `20240726_create_proposals.ts` - Not needed in assignment model

### Deleted Models
- ❌ `Proposal.ts` - No longer used

### Deleted Controllers & Services
- ❌ `providerController.ts` - Replaced with new assignment-based endpoints
- ❌ `providerService.ts` - Functionality moved to adminService and matchingService

## 🔄 Fresh Database Setup

Since you encountered migration errors, here's how to start fresh:

### Option 1: Drop and Recreate Database (Recommended)

```bash
# Drop the existing database
psql -U postgres
DROP DATABASE IF EXISTS servicehub_db;
CREATE DATABASE servicehub_db;
\q

# Run migrations fresh
npm run migrate

# Seed with sample data
npm run seed
```

### Option 2: Use the Reset Script

```bash
npm run db:reset
```

This will:
1. Rollback all migrations
2. Run migrations fresh
3. Seed sample data

## 📋 Remaining Migration Files (Correct Order)

These are the migrations that will run (in order):

1. `20230501_create_users.ts` - Base users table
2. `20240726_create_service_categories.ts` - Service categories
3. `20240726_create_service_tiers.ts` - Service tier pricing
4. `20240726_extend_users_table.ts` - Provider fields
5. `20240726_create_provider_categories.ts` - Provider qualifications
6. `20240726_create_service_requests.ts` - Service requests
7. `20240726_create_reviews.ts` - Review system
8. `20240726_create_notifications.ts` - Notifications
9. `20250930_update_to_assignment_model.ts` - ✨ New assignment-based updates

## 🎯 What Changed in the Assignment Model

### Database Changes

**service_requests table:**
- ❌ Removed: `selected_proposal_id` field
- ✅ Renamed: `selected_provider_id` → `assigned_provider_id`
- ✅ Added: `assigned_at`, `provider_accepted_at`, `provider_declined_at`, `decline_reason`
- ✅ Updated status: Now uses `'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'`

**users table:**
- ✅ Added: `total_jobs_declined`, `response_time_average`

**provider_categories table:**
- ✅ Added: `qualified_tiers` (JSON array: basic/expert/premium)

### Code Changes

**New Files Created:**
- `matchingService.ts` - Automatic provider matching algorithm
- `adminService.ts` - Admin operations (replaces old providerService)
- `dashboardService.ts` - Dashboard statistics
- `adminController.ts` - Admin endpoints
- `dashboardController.ts` - Dashboard endpoints
- `requestController.ts` - Completely rewritten for assignment model

**Updated Routes:**
- `providerRoutes.ts` - Now handles assignments instead of applications
- `requestRoutes.ts` - Simplified for assignment model
- `adminRoutes.ts` - New admin management routes

## 🚀 Testing After Migration

Once migrations complete successfully:

### 1. Check Health
```bash
curl http://localhost:4000/api/health
```

### 2. Login as Customer
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@email.com", "password": "password123"}'
```

### 3. Create a Service Request (as customer)
```bash
curl -X POST http://localhost:4000/api/service-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "categoryId": 1,
    "tierId": 1,
    "title": "Leaky faucet repair",
    "description": "Kitchen faucet has been dripping",
    "address": "123 Main St",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "urgency": "medium",
    "estimatedHours": 2
  }'
```

### 4. Check Provider Assignments (as provider)
```bash
# Login as provider first
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "maria.garcia@email.com", "password": "password123"}'

# Check assignments
curl http://localhost:4000/api/providers/assignments \
  -H "Authorization: Bearer PROVIDER_TOKEN"
```

## 🐛 Troubleshooting

### If migrations still fail:

1. **Check if tables already exist:**
   ```sql
   psql -U postgres -d servicehub_db
   \dt
   ```
   
   If you see existing tables, drop them:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   \q
   ```

2. **Re-run migrations:**
   ```bash
   npm run migrate
   npm run seed
   ```

### If you see "proposals" references:

All proposal references have been removed. If you see any errors mentioning proposals, it means:
- Old migration files weren't deleted (check `src/db/migrations/`)
- You need to clear your `migrations_history` table:
  ```sql
  DELETE FROM migrations_history 
  WHERE name LIKE '%proposal%';
  ```

## ✅ Verification Checklist

After setup, verify:
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health endpoint works (`/api/health`)
- [ ] Can login with demo accounts
- [ ] Can create service request (triggers matching)
- [ ] Provider receives notification (check `/api/providers/assignments`)
- [ ] Provider can accept assignment
- [ ] No "proposal" or "Proposal" errors anywhere

## 📞 Need Help?

If you encounter issues:
1. Check the logs carefully
2. Ensure PostgreSQL is running
3. Verify DATABASE_URL in .env
4. Try the fresh database setup (Option 1 above)

---

**The database is now clean and ready for the assignment-based model! 🎉**


