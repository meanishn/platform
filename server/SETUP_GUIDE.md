# Server Setup Guide

## Initial Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up PostgreSQL Database

```bash
# Create database (using psql or GUI tool)
createdb servicehub_db

# Or in psql:
psql -U postgres
CREATE DATABASE servicehub_db;
\q
```

### 3. Create .env File

Create a `.env` file in the `server/` directory with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/servicehub_db

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: Replace `postgres:password` with your actual PostgreSQL credentials!

### 4. Run Database Migrations

```bash
npm run migrate
```

This creates all database tables according to the schema.

### 5. Seed Database with Sample Data

```bash
npm run seed
```

This creates:
- 1 Admin user
- 2 Provider users (with qualifications)
- 1 Customer user
- Service categories and tiers
- Provider qualifications

### 6. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:4000`

## Verification

### Check Health Endpoint

```bash
curl http://localhost:4000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### Test Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@email.com", "password": "password123"}'
```

Should return user data and JWT token.

## Demo Accounts

After seeding, these accounts are available:

### Admin Account
- Email: `admin@platform.com`
- Password: `admin123`
- Access: Full platform administration

### Provider Accounts

**John Smith (Electrician)**
- Email: `john.smith@email.com`
- Password: `password123`
- Qualified: Electrical services (Basic, Expert, Premium)

**Maria Garcia (Plumber)**
- Email: `maria.garcia@email.com`
- Password: `password123`
- Qualified: Plumbing services (Basic, Expert, Premium)

### Customer Account
- Email: `customer@email.com`
- Password: `password123`
- Role: Regular customer

## Troubleshooting

### Issue: Cannot connect to database

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Check if PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in .env matches your PostgreSQL setup
3. Ensure PostgreSQL is listening on port 5432

### Issue: Migration fails

**Error**: `relation "users" already exists`

**Solution**:
```bash
npm run migrate:rollback
npm run migrate
```

### Issue: JWT verification fails

**Error**: `jwt malformed` or `invalid signature`

**Solution**:
- Ensure JWT_SECRET is set in .env
- JWT_SECRET must be the same across server restarts
- Client must send token as `Bearer <token>` in Authorization header

### Issue: "No qualified providers" for requests

**Cause**: Providers not properly seeded or qualifications missing

**Solution**:
```bash
npm run db:reset
```

This resets the entire database and re-seeds with proper data.

## Database Reset

To completely reset the database (useful during development):

```bash
npm run db:reset
```

This will:
1. Rollback all migrations
2. Run migrations fresh
3. Seed sample data

⚠️ **Warning**: This deletes ALL data!

## Next Steps

1. ✅ Verify server is running
2. ✅ Test login with demo accounts
3. ✅ Set up the frontend client
4. ✅ Test the complete workflow:
   - Customer creates service request
   - Provider receives notification
   - Provider accepts assignment
   - Provider completes job
   - Customer leaves review

## Production Deployment

For production deployment:

1. **Update .env**:
   ```env
   NODE_ENV=production
   DATABASE_URL=<production-database-url>
   JWT_SECRET=<strong-random-secret>
   CORS_ORIGIN=<production-frontend-url>
   ```

2. **Build TypeScript**:
   ```bash
   npm run build
   ```

3. **Start production server**:
   ```bash
   npm start
   ```

4. **Use a process manager** (PM2, systemd, etc.):
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name servicehub-api
   ```

## Support

If you encounter issues not covered here:

1. Check the main [README.md](./README.md)
2. Review the [Technical Specification](../TECHNICAL_SPEC.md)
3. Check database migrations in `src/db/migrations/`

---

**Happy coding! 🚀**


