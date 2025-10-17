# Platform - Service Request Management System

A full-stack service request management platform connecting customers with service providers.

## 🚀 Quick Links

- **[Deploy to Production](./QUICKSTART.md)** - Get deployed in 15-30 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[Deployment Summary](./DEPLOYMENT_SUMMARY.md)** - What's been added for production

## 📋 Project Structure

```
platform/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── shared-types/    # Shared TypeScript types
└── scripts/         # Deployment and automation scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Real-time:** Socket.IO Client

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL + Knex + Objection ORM
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.IO

## 🏁 Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL (via Docker or local)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

2. **Start PostgreSQL:**
   ```bash
   cd server
   docker-compose up -d
   ```

3. **Configure environment:**
   ```bash
   # Server
   cp server/env.example server/.env
   # Edit server/.env with your values
   
   # Client
   cp client/env.example client/.env
   # Edit client/.env with backend URL
   ```

4. **Run migrations and seeds:**
   ```bash
   cd server
   npm run migrate
   npm run seed
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Open browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

## 🎭 Demo Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@example.com | password123 |
| Provider | provider@example.com | password123 |
| Admin | admin@example.com | password123 |

## 🚀 Production Deployment

Your app is **production-ready** and can be deployed to Render.com for free!

### Quick Deploy (15-30 minutes)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy:**
   - Follow [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions
   - Or use automated deployment: `./scripts/deploy.sh`

3. **Setup Keep-Alive:**
   ```bash
   # Prevent cold starts on free tier
   ./scripts/setup-keepalive-cron.sh
   ```

### What's Included

✅ Health check endpoint (`/health`)  
✅ Production CORS configuration  
✅ SSL-enabled database setup  
✅ Infrastructure-as-code (`render.yaml`)  
✅ Deployment scripts  
✅ Keep-alive system  
✅ Comprehensive documentation  

See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) for complete list.

## 📚 Documentation

### Deployment
- [**QUICKSTART.md**](./QUICKSTART.md) - Fast deployment guide
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Comprehensive deployment guide
- [**DEPLOYMENT_CHECKLIST.md**](./DEPLOYMENT_CHECKLIST.md) - Printable checklist
- [**DEPLOYMENT_SUMMARY.md**](./DEPLOYMENT_SUMMARY.md) - What's been added

### Architecture
- [**DESIGN_SYSTEM.md**](./DESIGN_SYSTEM.md) - UI/UX design system
- [**USER_FLOW_DOCUMENTATION.md**](./USER_FLOW_DOCUMENTATION.md) - User flows
- [**STATUS_FLOW_QUICK_REFERENCE.md**](./STATUS_FLOW_QUICK_REFERENCE.md) - Status flow guide
- [**REFACTOR_GUIDELINE.md**](./REFACTOR_GUIDELINE.md) - Code standards

### Server
- [**server/README.md**](./server/README.md) - Backend documentation
- [**server/SERVER_ENDPOINT_GUIDELINES.md**](./server/SERVER_ENDPOINT_GUIDELINES.md) - API guidelines

### Scripts
- [**scripts/README.md**](./scripts/README.md) - Deployment scripts documentation

## 🧪 Testing

```bash
# Backend (if tests exist)
cd server
npm test

# Frontend (if tests exist)
cd client
npm test
```

## 📝 Available Scripts

### Backend
```bash
npm run dev              # Development with hot reload
npm run build            # Build for production
npm start                # Start production server
npm run migrate          # Run migrations
npm run migrate:prod     # Run production migrations
npm run seed             # Run seeds
npm run seed:prod        # Run production seeds
npm run health-check     # Check server health
```

### Frontend
```bash
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Deployment
```bash
./scripts/deploy.sh --verify    # Verify deployment config
./scripts/deploy.sh --manual    # Show deployment instructions
./scripts/deploy.sh             # Deploy to Render
node scripts/keep-alive.js URL  # Test keep-alive
./scripts/setup-keepalive-cron.sh  # Setup keep-alive cron
```

## 🔐 Environment Variables

### Server (.env)
```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://platform_user:platform_password@localhost:5433/platform
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

See [server/env.example](./server/env.example) for complete list.

### Client (.env)
```bash
VITE_API_URL=http://localhost:4000
```

See [client/env.example](./client/env.example) for details.

## 🌟 Features

- ✅ User authentication (JWT + Passport)
- ✅ Role-based access control (Customer, Provider, Admin)
- ✅ Service request management
- ✅ Provider matching system
- ✅ Real-time notifications (Socket.IO)
- ✅ Review and rating system
- ✅ Admin dashboard
- ✅ Responsive design (Tailwind CSS)
- ✅ Type-safe API (TypeScript)

## 💰 Deployment Cost

### Free Tier (Render.com)
- **Backend:** Free (with cold starts)
- **Frontend:** Free
- **Database:** Free for 90 days, then $7/month
- **Total:** $0 for 3 months, then $7/month

### With Keep-Alive
- Use [cron-job.org](https://cron-job.org/) (free) to prevent cold starts
- Server stays awake 24/7!

## 🆘 Troubleshooting

### Local Development

**Database connection error:**
```bash
# Ensure Docker is running
docker-compose up -d

# Check connection
docker ps
```

**Port already in use:**
```bash
# Change PORT in server/.env
PORT=4001
```

### Production Deployment

See [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#troubleshooting) for complete guide.

Common issues:
- **Build fails:** Check logs, verify dependencies
- **CORS error:** Update `CLIENT_URL` in backend
- **Database error:** Verify DATABASE_URL, check SSL config
- **Cold start slow:** Setup keep-alive system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

Built with modern web technologies and best practices.

---

## 🚀 Ready to Deploy?

Start with the [Quick Start Guide](./QUICKSTART.md) and get deployed in 15-30 minutes!

**Have questions?** Check the [comprehensive deployment guide](./DEPLOYMENT.md).

**Happy coding! 🎉**

