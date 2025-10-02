# ServiceHub Platform - Backend API

Production-ready Node.js + TypeScript backend implementing an assignment-based service coordination platform.

## 🎯 Overview

This backend API implements **automatic provider matching** with fixed tier-based pricing - a key differentiator from traditional service marketplaces:

- ✅ **Automatic provider matching** - no browsing/selection by customers
- ✅ **Fixed tier-based pricing** - no bidding or proposals
- ✅ **Assignment-first workflow** - providers receive notifications, first to accept wins
- ✅ **Payment outside platform** - no in-app payment processing

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 13.x
- npm >= 9.x

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update DATABASE_URL and JWT_SECRET in .env
# DATABASE_URL=postgresql://username:password@localhost:5432/servicehub_db
# JWT_SECRET=your-secret-key-here

# Run migrations
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The server will start on `http://localhost:4000`

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration (Passport, etc.)
│   ├── controllers/           # Request handlers
│   ├── models/                # Objection.js models
│   ├── services/              # Business logic
│   │   ├── matchingService.ts      # 🔥 Core matching algorithm
│   │   ├── requestService.ts       # Service request management
│   │   ├── notificationService.ts  # Notifications
│   │   ├── reviewService.ts        # Reviews & ratings
│   │   ├── dashboardService.ts     # Dashboard statistics
│   │   └── adminService.ts         # Admin operations
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   ├── db/                    # Database migrations & seeds
│   ├── validators/            # Request validation
│   └── types/                 # TypeScript type definitions
├── package.json
└── tsconfig.json
```

## 🗄️ Database

### Technology Stack

- **Database**: PostgreSQL
- **ORM**: Objection.js + Knex
- **Migrations**: Knex migrations

### Key Tables

- `users` - User accounts (customers, providers, admins)
- `service_categories` - Service types (Plumbing, Electrical, HVAC, etc.)
- `service_tiers` - Tier levels (Basic, Expert, Premium) with hourly rates
- `service_requests` - Customer service requests
- `provider_categories` - Provider qualifications & tier certifications
- `reviews` - Customer reviews for completed jobs
- `notifications` - System notifications

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Reset database (rollback + migrate + seed)
npm run db:reset
```

## 🔐 Authentication

### JWT-Based Authentication

- **Access Token**: Stored in client localStorage
- **Token Format**: `Bearer <token>`
- **Expiration**: 7 days (configurable)

### Demo Accounts

```
Admin:
- Email: admin@platform.com
- Password: admin123

Provider (John Smith - Electrician):
- Email: john.smith@email.com
- Password: password123

Provider (Maria Garcia - Plumber):
- Email: maria.garcia@email.com
- Password: password123

Customer:
- Email: customer@email.com
- Password: password123
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
GET    /api/auth/verify        # Verify JWT token
```

### Service Categories
```
GET    /api/service-categories           # Get all categories with tiers
GET    /api/service-categories/:id       # Get category details
```

### Service Requests (Customers)
```
POST   /api/service-requests             # Create request (triggers matching)
GET    /api/service-requests             # Get user's requests
GET    /api/service-requests/:id         # Get request details
PATCH  /api/service-requests/:id/cancel  # Cancel request
GET    /api/requests/:requestId/assigned-provider  # Get assigned provider
```

### Provider Assignments
```
GET    /api/providers/assignments        # Get assignments
PATCH  /api/providers/assignments/accept # Accept assignment
PATCH  /api/providers/assignments/decline # Decline assignment
PATCH  /api/service-requests/:id/start   # Start job
PATCH  /api/service-requests/:id/complete # Complete job
```

### Reviews
```
POST   /api/reviews/requests/:requestId  # Create review
GET    /api/reviews/providers/:providerId # Get provider reviews
GET    /api/reviews/requests/:requestId  # Get request review
```

### Notifications
```
GET    /api/notifications                # Get notifications
GET    /api/notifications/unread-count   # Get unread count
PATCH  /api/notifications/:id/read       # Mark as read
PATCH  /api/notifications/read-all       # Mark all as read
DELETE /api/notifications/:id            # Delete notification
```

### Dashboard Statistics
```
GET    /api/customers/dashboard/stats    # Customer dashboard
GET    /api/providers/dashboard/stats    # Provider dashboard
GET    /api/admin/dashboard/stats        # Admin dashboard
GET    /api/dashboard/stats              # Generic (role-based)
```

### Admin Operations
```
GET    /api/admin/users                  # List users
PATCH  /api/admin/providers/:id/approve  # Approve provider
PATCH  /api/admin/providers/:id/reject   # Reject provider
PATCH  /api/admin/providers/:id/suspend  # Suspend provider
GET    /api/admin/analytics              # Platform analytics
```

## 🎯 Core Business Logic

### Automatic Provider Matching Algorithm

Located in `src/services/matchingService.ts`

When a customer creates a service request, the system automatically:

#### 1. Filters Qualified Providers
- Provider status = 'approved'
- isAvailable = true
- Has category qualification
- Has tier qualification (basic/expert/premium)
- Not exceeding max concurrent assignments (5)

#### 2. Scores & Ranks Providers
```typescript
score = 
  distance_score * 0.30 +          // Closer is better
  rating_score * 0.25 +             // Higher rating is better
  completion_rate_score * 0.20 +    // Higher completion rate is better
  response_time_score * 0.15 +      // Faster response is better
  experience_score * 0.10           // More jobs is better
```

#### 3. Notifies Top 5 Providers
- Creates notifications for top-ranked providers
- Includes request details, urgency, estimated pay
- Sets response window based on urgency (10-60 minutes)

#### 4. First-Come Assignment
- First provider to accept gets the job
- Other providers notified that assignment is filled
- If all decline, system rematches to next batch

### Provider Qualification System

Providers are qualified by:
- **Category**: Which service types they can provide (Plumbing, Electrical, etc.)
- **Tier Level**: Which quality tiers they can handle (Basic, Expert, Premium)

Example:
```typescript
{
  category_id: 1,  // Plumbing
  qualified_tiers: ['basic', 'expert', 'premium']  // Can handle all tiers
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables

Required for production:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=secure-random-string
CORS_ORIGIN=https://yourdomain.com
```

### Build & Deploy

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Recommended Hosting

- **API**: Heroku, Railway, Render, or AWS Elastic Beanstalk
- **Database**: Heroku Postgres, AWS RDS, or DigitalOcean Managed PostgreSQL

## 📊 Database Schema Migrations

### Latest Changes (v1.1 - Assignment-Based Model)

Migration: `20250930_update_to_assignment_model.ts`

**Key Changes:**
- ❌ Removed `selected_proposal_id` field
- ✅ Renamed `selected_provider_id` → `assigned_provider_id`
- ✅ Added `assigned_at`, `provider_accepted_at`, `provider_declined_at`
- ✅ Updated status enum: removed 'proposals', 'accepted', 'expired'
- ✅ Added `total_jobs_declined`, `response_time_average` to users table
- ✅ Added `qualified_tiers` to provider_categories table

## 🔧 Development Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run migrate          # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed             # Seed database with sample data
npm run db:reset         # Reset database (rollback + migrate + seed)
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional validation errors
}
```

## 🛡️ Security

- JWT token authentication
- Bcrypt password hashing (salt rounds: 10)
- Role-based access control (RBAC)
- Input validation using express-validator
- SQL injection protection (Objection.js/Knex parameterized queries)
- CORS configuration
- Helmet security headers

## 📈 Performance Considerations

- Database indexes on frequently queried fields
- Efficient provider matching algorithm
- Pagination for list endpoints
- Async/await for non-blocking operations
- Connection pooling for database

## 🐛 Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### Migration Error
```
Error: migration "..." has already been run
```
**Solution**: Run `npm run migrate:rollback` then `npm run migrate`

### JWT Verification Failed
```
Error: jwt malformed
```
**Solution**: Ensure JWT_SECRET matches between server restarts

## 📚 Additional Documentation

- [Technical Specification](../TECHNICAL_SPEC.md) - Complete platform specification
- [API Documentation](./API_DOCUMENTATION.md) - Detailed API docs
- [Frontend Design](./FRONTEND_DESIGN.md) - Frontend guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the ServiceHub Platform.

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ using Node.js, TypeScript, PostgreSQL, and Objection.js**
