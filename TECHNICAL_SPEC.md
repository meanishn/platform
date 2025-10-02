# ServiceHub Platform - Technical Specification

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Current Implementation Status](#current-implementation-status)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [System Architecture](#system-architecture)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [User Roles & Workflows](#user-roles--workflows)
- [UI Components](#ui-components)
- [Features Implemented](#features-implemented)
- [Features To Be Implemented](#features-to-be-implemented)
- [Development Guidelines](#development-guidelines)

---

## 📖 Project Overview

**ServiceHub** is a comprehensive service coordination platform that connects customers with qualified service providers across various utility categories. The platform uses an intelligent backend matching system to automatically assign service requests to appropriate providers based on service type, tier level, location, and provider qualifications. The platform facilitates the entire service lifecycle from request creation to completion, including automatic provider assignment, service execution tracking, and reviews.

### Core Purpose
- Enable customers to request services by selecting service categories and quality tiers
- Automatically match and notify qualified service providers based on service type selection
- Allow service providers to accept or decline service assignments
- Provide administrators with tools to manage the platform, verify providers, and monitor operations
- Create a transparent, secure, and efficient service coordination platform

### Primary User Types
1. **Customers** - Request and book services
2. **Service Providers** - Offer services and fulfill requests
3. **Administrators** - Manage platform operations and user verification

### Key Business Model Notes
- **No Direct Provider Selection**: Customers select service category and tier; backend automatically matches and notifies qualified providers
- **Tier-Based Pricing**: Three service tiers (Basic, Expert, Premium) with predetermined hourly rates shown to customers
- **Payment Outside App**: All payments are handled outside the platform (cash, bank transfer, etc.) - no in-app payment processing
- **First-Come Assignment**: First available qualified provider to accept gets the assignment

---

## 🔄 Key Platform Differences from Traditional Marketplaces

This platform differs from traditional service marketplaces in several important ways:

### 1. **Automatic Provider Matching (No Browsing/Selection)**
- ❌ Customers **CANNOT** browse a list of providers
- ❌ Customers **CANNOT** choose which specific provider to hire
- ✅ Backend **AUTOMATICALLY** matches requests to qualified providers
- ✅ System notifies multiple qualified providers simultaneously
- ✅ First provider to accept gets the assignment

### 2. **Fixed Tier-Based Pricing (No Proposals)**
- ❌ Providers **CANNOT** submit custom bids or proposals
- ❌ No negotiation or price comparison by customers
- ✅ Prices are **FIXED** per tier level (Basic/Expert/Premium)
- ✅ Customers see estimated hourly rates before requesting
- ✅ Provider's tier qualification determines which requests they receive

### 3. **Payment Outside Platform**
- ❌ No in-app payment processing
- ❌ No credit card integration or payment gateways
- ❌ No escrow or platform transaction fees
- ✅ Payment is handled **directly between customer and provider**
- ✅ Methods: cash, bank transfer, or any agreed method
- ✅ Platform only tracks completion status, not payments

### 4. **Assignment-Based (Not Marketplace-Based)**
This is a **service coordination system**, not a traditional marketplace:
- Requests are **assigned**, not browsed
- Pricing is **standardized**, not negotiated
- Provider selection is **automatic**, not manual
- Payment is **offline**, not in-app

---

## 🚀 Current Implementation Status

### ✅ Completed Features

#### 1. Authentication System (Production-Ready)
- **Persistent Authentication**: JWT tokens stored in localStorage with automatic verification
- **Token Management**: Token-user mapping with proper validation
- **Role-Based Access Control**: Three user roles (customer, provider, admin)
- **Protected Routes**: Route guards with automatic redirects based on authentication status
- **Demo Credentials**:
  - Admin: `admin@example.com` / `password`
  - Provider: `provider@example.com` / `password`
  - Customer: `customer@example.com` / `password`

#### 2. User Interface Components
- **Layout System**: Header, Sidebar, Layout wrapper components
- **UI Components**: Button, Card, Badge, Input, Select, Form, Modal
- **Authentication UI**: Login form, Register form, Auth loading screens
- **Navigation**: Role-based header navigation with user avatar
- **Notifications**: Toast notifications and notification bell with real-time updates

#### 3. Dashboard Views (All Three Roles)
- **Customer Dashboard**: Activity overview, stats, quick actions
- **Provider Dashboard**: Business metrics, service requests, earnings overview
- **Admin Dashboard**: Platform statistics, user management, pending verifications

#### 4. Service Management
- **Service Categories**: Predefined categories with tiers (Basic, Experienced, Premium)
- **Service Browsing**: Filterable service catalog with search functionality
- **Service Request Creation**: Multi-step form for creating service requests
- **Request Tracking**: Real-time status updates for service requests

#### 5. Mock API (MSW)
- Complete mock backend using Mock Service Worker (MSW)
- Realistic data generation using Faker.js
- LocalStorage-based persistence for service requests
- Automatic request status simulation (pending → accepted → in_progress → completed)

### 🔨 Partially Implemented

- **Service Request Flow**: Basic creation and tracking implemented, proposal system pending
- **Notification System**: Structure exists but limited integration with actual events
- **Profile Management**: Basic profile component exists but incomplete functionality

### ❌ Not Yet Implemented

- Payment processing and financial transactions
- Provider verification workflow
- Review and rating system
- Real-time chat/messaging between users
- File upload for service documentation
- Advanced search and filtering
- Geolocation and map integration
- Mobile responsiveness optimization
- Email notifications
- Provider availability calendar
- Analytics and reporting dashboards

---

## 🛠 Architecture & Technology Stack

### Frontend Framework
```json
{
  "framework": "React 19.1.0",
  "language": "TypeScript 5.8.3",
  "build-tool": "Vite 7.0.4",
  "routing": "React Router DOM 7.7.1"
}
```

### Styling & UI
```json
{
  "css-framework": "Tailwind CSS 4.1.11",
  "styling": "CSS-in-JS, SCSS support",
  "icons": "Emoji-based icons (can be replaced with icon library)"
}
```

### State Management
```json
{
  "global-state": "React Context API",
  "contexts": [
    "AuthContext - User authentication and session",
    "NotificationContext - App-wide notifications"
  ],
  "local-state": "React useState/useReducer hooks"
}
```

### API & Data Mocking
```json
{
  "mock-api": "MSW (Mock Service Worker) 2.10.4",
  "data-generation": "@faker-js/faker 9.9.0",
  "date-utilities": "date-fns 4.1.0"
}
```

### Development Tools
```json
{
  "linter": "ESLint 9.30.1",
  "type-checking": "TypeScript",
  "dev-server": "Vite Dev Server"
}
```

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Application                   │
│                   (React + TypeScript)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Mock API Layer                       │
│              (MSW - Development Only)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Replace with Real Backend
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                          │
│              (To Be Implemented)                        │
│   - REST/GraphQL API                                    │
│   - JWT Authentication                                  │
│   - Database (PostgreSQL/MongoDB)                       │
│   - File Storage (S3/CloudStorage)                      │
│   - Payment Gateway Integration                         │
└─────────────────────────────────────────────────────────┘
```

### Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication-related components
│   ├── layout/         # Layout components (Header, Sidebar, Layout)
│   ├── notifications/  # Notification components
│   └── ui/             # Base UI components (Button, Card, etc.)
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── pages/              # Page components (routes)
│   ├── admin/         # Admin-specific pages
│   ├── auth/          # Authentication pages
│   ├── customer/      # Customer-specific pages
│   ├── provider/      # Provider-specific pages
│   └── shared/        # Shared pages (Profile, Notifications)
├── types/              # TypeScript type definitions
│   ├── api.ts
│   ├── service.ts
│   └── user.ts
├── mocks/              # Mock API handlers
│   ├── browser.ts
│   └── handlers.ts
├── services/           # API service functions
└── styles/             # Global styles
```

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  
  // Role & Permissions
  isServiceProvider: boolean;
  isAdmin: boolean;
  role: 'customer' | 'provider' | 'admin';
  
  // Provider-specific fields
  providerStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  providerApprovedAt?: string;
  approvedBy?: number;
  providerBio?: string;
  providerSkills?: string[];
  providerCertifications?: Certification[];
  
  // Provider qualifications
  qualifiedCategories?: number[]; // Array of category IDs provider can serve
  qualifiedTiers?: {
    categoryId: number;
    tiers: ('basic' | 'expert' | 'premium')[];
  }[];
  
  // Provider metrics
  averageRating?: number;
  totalJobsCompleted: number;
  totalJobsDeclined: number;
  responseTimeAverage?: number; // in minutes
  isAvailable: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### Service Category Model
```typescript
interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tiers?: ServiceTier[];
}
```

### Service Tier Model
```typescript
interface ServiceTier {
  id: number;
  name: string; // 'Basic', 'Experienced', 'Premium'
  description?: string;
  baseHourlyRate: number;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
}
```

### Service Request Model
```typescript
interface ServiceRequest {
  id: number;
  userId: number;
  categoryId: number;
  tierId: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  preferredDate?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  estimatedHours?: number;
  images?: string[];
  
  // Status & Assignment
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedProviderId?: number;
  assignedAt?: string;
  
  // Provider response
  providerAcceptedAt?: string;
  providerDeclinedAt?: string;
  declineReason?: string;
  
  // Timestamps
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
  category?: ServiceCategory;
  tier?: ServiceTier;
  assignedProvider?: User;
}
```

### Provider Notification Model
```typescript
interface ProviderNotification {
  id: number;
  providerId: number;
  requestId: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  notifiedAt: string;
  respondedAt?: string;
  expiresAt?: string;
  
  // Relations
  provider?: User;
  request?: ServiceRequest;
}
```

### Review Model
```typescript
interface Review {
  id: number;
  requestId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number; // 1-5
  comment?: string;
  criteriaRatings?: {
    quality?: number;
    timeliness?: number;
    communication?: number;
    professionalism?: number;
    value?: number;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  request?: ServiceRequest;
  reviewer?: User;
  reviewee?: User;
}
```

### Notification Model
```typescript
interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  isPushSent: boolean;
  isEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/auth/verify` | Verify JWT token | Yes (Bearer) |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes |

### User & Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get current user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| POST | `/api/users/avatar` | Upload profile image | Yes |
| POST | `/api/users/apply-provider` | Apply to become a provider | Yes |

### Service Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/service-categories` | Get all active categories | No |
| GET | `/api/service-categories/:id` | Get category with tiers | No |
| POST | `/api/service-categories` | Create new category | Yes (Admin) |
| PUT | `/api/service-categories/:id` | Update category | Yes (Admin) |
| DELETE | `/api/service-categories/:id` | Delete category | Yes (Admin) |

### Service Request Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/service-requests` | Get user's service requests | Yes |
| GET | `/api/service-requests/:id` | Get specific request details | Yes |
| POST | `/api/service-requests` | Create new request (triggers backend matching) | Yes (Customer) |
| PUT | `/api/service-requests/:id` | Update request (before assignment) | Yes (Owner) |
| PATCH | `/api/service-requests/:id/cancel` | Cancel request | Yes (Owner) |
| PATCH | `/api/service-requests/:id/start` | Mark work as started | Yes (Assigned Provider) |
| PATCH | `/api/service-requests/:id/complete` | Mark work as completed | Yes (Assigned Provider) |
| DELETE | `/api/service-requests/:id` | Delete request | Yes (Owner/Admin) |

### Provider Assignment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/providers/assignments` | Get provider's assigned/pending requests | Yes (Provider) |
| PATCH | `/api/assignments/:id/accept` | Accept service assignment | Yes (Provider) |
| PATCH | `/api/assignments/:id/decline` | Decline assignment with reason | Yes (Provider) |
| GET | `/api/requests/:requestId/assigned-provider` | Get assigned provider info | Yes (Customer/Owner) |

### Provider Matching Algorithm (Backend Process)

**Critical Business Logic**: When a customer creates a service request, the backend automatically:

```typescript
// Step 1: Filter Qualified Providers
const qualifiedProviders = providers.filter(provider => {
  return (
    provider.providerStatus === 'approved' &&
    provider.isAvailable === true &&
    provider.qualifiedCategories.includes(request.categoryId) &&
    provider.qualifiedTiers[request.categoryId].includes(request.tierId) &&
    provider.activeAssignments < MAX_CONCURRENT_ASSIGNMENTS
  );
});

// Step 2: Score and Sort by Priority
const scoredProviders = qualifiedProviders.map(provider => ({
  provider,
  score: calculateScore({
    distance: calculateDistance(provider.location, request.location),
    rating: provider.averageRating,
    completionRate: provider.completionRate,
    responseTime: provider.responseTimeAverage,
    totalJobsCompleted: provider.totalJobsCompleted
  })
})).sort((a, b) => b.score - a.score);

// Step 3: Notify Top Candidates
const topProviders = scoredProviders.slice(0, 5); // Notify top 5
topProviders.forEach(({ provider }) => {
  sendProviderNotification(provider.id, request.id);
  // Notification includes: request details, estimated pay, location, urgency
});

// Step 4: First to Accept Wins
// Provider sees notification → reviews details → accepts/declines
// First acceptance assigns provider and updates request status
// Other providers are notified that assignment is filled
// If all decline, system notifies next batch
```

**Notification Response Window**:
- Providers have **15-30 minutes** to respond to assignment notifications
- After timeout, request is re-matched to next batch of providers
- High urgency requests have shorter response windows

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| PATCH | `/api/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |
| DELETE | `/api/notifications` | Clear all notifications | Yes |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Yes |
| GET | `/api/customers/dashboard/stats` | Customer-specific stats | Yes (Customer) |
| GET | `/api/providers/dashboard/stats` | Provider-specific stats | Yes (Provider) |
| GET | `/api/admin/dashboard/stats` | Admin platform stats | Yes (Admin) |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/requests/:requestId/reviews` | Create review | Yes |
| GET | `/api/providers/:providerId/reviews` | Get provider reviews | No |
| GET | `/api/reviews/:id` | Get specific review | No |
| PUT | `/api/reviews/:id` | Update review | Yes (Owner) |
| DELETE | `/api/reviews/:id` | Delete review | Yes (Owner/Admin) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Yes (Admin) |
| PATCH | `/api/admin/users/:id/verify` | Verify user | Yes (Admin) |
| PATCH | `/api/admin/providers/:id/approve` | Approve provider | Yes (Admin) |
| PATCH | `/api/admin/providers/:id/reject` | Reject provider | Yes (Admin) |
| PATCH | `/api/admin/providers/:id/suspend` | Suspend provider | Yes (Admin) |
| GET | `/api/admin/analytics` | Platform analytics | Yes (Admin) |

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: number;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  iat: number; // Issued at
  exp: number; // Expiration time
}
```

### Token Storage
- **Access Token**: Stored in `localStorage` as `'token'`
- **User Data**: Stored in `localStorage` as `'user'` (JSON string)
- **Token Format**: `Bearer <token>` in Authorization header

### Authorization Levels

| Route Pattern | Customer | Provider | Admin |
|--------------|----------|----------|-------|
| `/` (root) | ✅ Redirect to dashboard | ✅ Redirect to provider dashboard | ✅ Redirect to admin dashboard |
| `/login`, `/register` | ✅ (redirects if logged in) | ✅ (redirects if logged in) | ✅ (redirects if logged in) |
| `/dashboard` | ✅ | ❌ | ❌ |
| `/services` | ✅ | ✅ | ✅ |
| `/requests` | ✅ | ❌ | ❌ |
| `/request-service` | ✅ | ❌ | ❌ |
| `/provider/dashboard` | ❌ | ✅ | ❌ |
| `/provider/*` | ❌ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ✅ |
| `/profile` | ✅ | ✅ | ✅ |
| `/notifications` | ✅ | ✅ | ✅ |

### Protected Route Implementation
```typescript
// Routes automatically redirect based on:
// 1. Authentication status (logged in/out)
// 2. User role (customer/provider/admin)
// 3. Route requirements

<ProtectedRoute>
  // Component only renders if authenticated
</ProtectedRoute>

<RoleGuard allowedRoles={['admin']}>
  // Component only renders for specified roles
</RoleGuard>
```

---

## 👥 User Roles & Workflows

### Customer Workflow

```
1. Registration/Login
   ↓
2. Create Service Request
   ↓
3. Select Service Category
   - Choose from: Plumbing, Electrical, HVAC, Cleaning, Landscaping
   ↓
4. Select Service Tier
   - Basic: Lower hourly rate, standard service
   - Expert: Mid-range rate, experienced professionals
   - Premium: Higher rate, top-tier professionals
   ↓
5. Provide Request Details
   - Title and description
   - Location/address
   - Preferred date & urgency level
   - Estimated hours needed
   ↓
6. Submit Request
   ↓
7. Backend Automatically Notifies Qualified Providers
   - Based on service category and tier
   - Provider location/availability
   ↓
8. Provider Accepts Assignment
   - Customer receives notification
   - View assigned provider info
   ↓
9. Provider Completes Work
   ↓
10. Payment (Outside App)
    - Cash, bank transfer, or other methods
    ↓
11. Leave Review & Rating (Optional)
```

#### Customer Capabilities
- Create service requests with category and tier selection
- View tier-based estimated hourly rates
- Track request status in real-time
- View assigned provider information
- Communicate with assigned provider (messaging - to be implemented)
- Leave reviews and ratings after service completion (to be implemented)
- View service history
- Manage profile
- Receive notifications for status updates

### Provider Workflow

```
1. Registration as Customer
   ↓
2. Apply for Provider Status
   - Submit bio & skills
   - Upload certifications
   - Select service categories and tiers qualified for
   ↓
3. Admin Verification & Approval
   ↓
4. Receive Notification of Service Request Match
   - Backend automatically matches based on:
     * Service category
     * Service tier (Basic/Expert/Premium)
     * Provider location/availability
     * Provider qualifications
   ↓
5. Review Request Details
   - Customer requirements
   - Location
   - Preferred date
   - Urgency level
   - Estimated hours
   ↓
6. Accept or Decline Request
   ↓
7. If Accepted: Contact Customer & Schedule
   ↓
8. Complete Service Work
   ↓
9. Mark as Completed
   ↓
10. Customer Pays (Outside App)
    ↓
11. Receive Rating & Review from Customer
```

#### Provider Capabilities
- Apply for provider status with verification
- Receive automatic notifications for matching service requests
- Accept or decline service assignments
- View request details before accepting
- Manage availability status (available/busy)
- Set service categories and tiers they're qualified for
- Track active jobs and completion statistics
- Communicate with customers (to be implemented)
- Update profile, skills, and certifications
- View performance metrics and ratings
- Manage service tier qualifications

### Admin Workflow

```
1. Login as Admin
   ↓
2. Monitor Platform Activity
   ↓
3. Review Provider Applications
   - Verify credentials
   - Approve/Reject
   ↓
4. Manage Service Categories
   ↓
5. Handle Disputes & Reports
   ↓
6. Monitor Platform Metrics
```

#### Admin Capabilities
- Verify and approve provider applications
- Manage service categories and tiers
- View platform-wide analytics
- Monitor user activity
- Handle disputes and reports (to be implemented)
- Suspend/ban users
- Manage platform settings
- View financial reports (to be implemented)

---

## 🎨 UI Components

### Base Components (`src/components/ui/`)

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

#### Card
```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
}
```

#### Badge
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

#### Input
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

#### Select
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}
```

#### Modal
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}
```

### Feature Components

#### ServiceRequestForm
- Multi-step form for creating service requests
- Category and tier selection
- Location input with address
- Date picker for preferred scheduling
- Urgency level selection

#### NotificationBell
- Real-time notification counter
- Dropdown list of recent notifications
- Mark as read functionality

#### ToastNotification
- Auto-dismissing notifications
- Multiple types (success, error, info, warning)
- Position: top-right

### Layout Components

#### Header
- Logo and branding
- Role-based navigation links
- User profile display with avatar
- Notification bell
- Logout button

#### Sidebar (Optional/Unused currently)
- Can be implemented for navigation menu

#### Layout
- Wraps protected pages
- Includes Header
- Main content area with padding

---

## ✨ Features Implemented

### 1. User Authentication
- ✅ Email/password login
- ✅ User registration
- ✅ JWT token management
- ✅ Persistent sessions (localStorage)
- ✅ Auto token verification on app load
- ✅ Logout functionality
- ✅ Protected routes
- ✅ Role-based redirects

### 2. Service Categories
- ✅ 5 predefined categories:
  - Plumbing (🔧)
  - Electrical (⚡)
  - HVAC (❄️)
  - Cleaning (🧹)
  - Landscaping (🌿)
- ✅ Three tiers per category (Basic, Experienced, Premium)
- ✅ Base hourly rates for each tier
- ✅ Category icons

### 3. Service Category Selection
- ✅ Category selection interface (Plumbing, Electrical, HVAC, Cleaning, Landscaping)
- ✅ Tier selection (Basic, Expert, Premium)
- ✅ Display of estimated hourly rates per tier
- ✅ Category icons and descriptions

### 4. Service Request Creation
- ✅ Multi-step request form
- ✅ Category and tier selection
- ✅ Title and description input
- ✅ Address input (manual - geolocation pending)
- ✅ Preferred date selection
- ✅ Urgency level selection
- ✅ Estimated hours input
- ✅ Real-time form validation

### 5. Request Management
- ✅ My Requests page for customers
- ✅ Request status tracking
- ✅ Status badges (pending, accepted, in_progress, completed)
- ✅ Auto-refresh to show updates
- ✅ Request filtering (by status)
- ✅ Request search
- ✅ Status simulation (auto progression for demo)

### 6. Dashboards
- ✅ Customer Dashboard:
  - Active requests count
  - Completed jobs count
  - Total spent
  - Pending reviews
  - Recent activity feed
  - Quick action buttons
- ✅ Provider Dashboard:
  - Active requests
  - Completed jobs
  - Total earnings
  - Average rating
  - Response time
  - Completion rate
  - Recent service requests
- ✅ Admin Dashboard:
  - Total users
  - Total providers
  - Total customers
  - Pending verifications
  - Active requests
  - Total revenue
  - Monthly growth
  - Recent activity
  - Pending actions

### 7. Notifications
- ✅ Notification context provider
- ✅ Toast notifications with types
- ✅ Notification bell with counter
- ✅ Mark as read functionality
- ✅ Notification list (in dropdown)
- ✅ Auto-fetch notifications every 30s

### 8. UI/UX
- ✅ Glassmorphism design
- ✅ Gradient backgrounds
- ✅ Responsive layout (partial)
- ✅ Loading states with skeleton screens
- ✅ Empty states with helpful messages
- ✅ Hover effects and transitions
- ✅ Form validation feedback

---

## 🚧 Features To Be Implemented

### High Priority

#### 1. Provider Assignment System (Backend)
- [ ] Automatic matching algorithm implementation
- [ ] Provider notification system when requests match their qualifications
- [ ] Provider accept/decline functionality
- [ ] First-come-first-served assignment logic
- [ ] Reassignment if provider declines
- [ ] Assignment timeout and expiration handling

#### 2. Real-time Communication
- [ ] In-app messaging between customers and providers
- [ ] Message notifications
- [ ] Message history
- [ ] Typing indicators
- [ ] File attachments in messages

#### 3. Review & Rating System
- [ ] Submit reviews after service completion
- [ ] Star rating (1-5)
- [ ] Detailed criteria ratings (quality, timeliness, communication, professionalism, value)
- [ ] Review moderation by admin
- [ ] Provider response to reviews
- [ ] Review analytics

### Medium Priority

#### 4. Provider Verification Workflow
- [ ] Provider application form with document upload
- [ ] Admin review interface
- [ ] Approve/reject with reason
- [ ] Certification verification
- [ ] Background check integration (optional)
- [ ] Verification badge display

#### 5. Geolocation & Maps
- [ ] Google Maps / Mapbox integration
- [ ] Address autocomplete
- [ ] Location-based provider matching by proximity
- [ ] Service area definition for providers
- [ ] Distance calculation for assignment priority
- [ ] Map view of service address

#### 6. File Uploads
- [ ] Service request image uploads
- [ ] Provider certification document uploads
- [ ] Profile picture uploads
- [ ] Work completion photos
- [ ] File storage integration (AWS S3, Cloudinary, etc.)

#### 7. Provider Availability Calendar
- [ ] Calendar view for providers
- [ ] Set available/busy times
- [ ] Block specific dates
- [ ] Integration with request scheduling
- [ ] Automatic unavailability when booked

### Lower Priority

#### 8. Analytics & Reporting
- [ ] Provider performance analytics
- [ ] Customer usage analytics
- [ ] Platform-wide metrics dashboard
- [ ] Revenue reports
- [ ] Export functionality (CSV, PDF)
- [ ] Charts and visualizations

#### 9. Email Notifications
- [ ] Email service integration (SendGrid, Mailgun)
- [ ] Email templates
- [ ] Notification preferences
- [ ] Weekly digest emails
- [ ] Service completion confirmations

#### 10. Mobile App
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Mobile-optimized UI
- [ ] Camera integration for photos

#### 11. Advanced Features
- [ ] Recurring service bookings
- [ ] Service packages and bundles
- [ ] Provider tier progression (Basic → Expert → Premium)
- [ ] Referral program
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Offline mode for providers

---

## 📝 Development Guidelines

### Code Style

#### TypeScript Best Practices
```typescript
// Always define interfaces for props
interface ComponentProps {
  title: string;
  optional?: boolean;
}

// Use React.FC for functional components
export const Component: React.FC<ComponentProps> = ({ title, optional }) => {
  return <div>{title}</div>;
};

// Prefer named exports over default exports
export { Component };
```

#### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// 2. Type definitions
interface Props { }

// 3. Component
export const Component: React.FC<Props> = () => {
  // 4. Hooks
  const { user } = useAuth();
  const [state, setState] = useState();

  // 5. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // 6. Event handlers
  const handleClick = () => {
    // handler logic
  };

  // 7. Render
  return (
    <div>{/* JSX */}</div>
  );
};
```

### State Management Guidelines

#### When to Use Context
- Global app state (auth, theme, notifications)
- Data needed by many components across different levels
- Avoid prop drilling

#### When to Use Local State
- Component-specific UI state
- Form inputs
- Toggle states
- Data that doesn't need to be shared

### API Integration

#### Migration from Mock to Real API
```typescript
// Current (Mock):
const response = await fetch('/api/service-requests');

// Future (Real API):
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const response = await fetch(`${API_BASE_URL}/api/service-requests`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

#### Error Handling
```typescript
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  showToast({
    type: 'error',
    message: 'Something went wrong. Please try again.'
  });
}
```

### Styling Guidelines

#### Tailwind CSS Usage
```typescript
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// Use custom classes for complex repeated styles
<div className="glass-card">

// Conditional classes
<div className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}>
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Testing (To Be Implemented)

#### Unit Tests
- Test individual components
- Test utility functions
- Test custom hooks

#### Integration Tests
- Test user flows
- Test API interactions
- Test form submissions

#### E2E Tests
- Test complete user journeys
- Test authentication flow
- Test service request flow

### Security Best Practices

#### Frontend Security
- Never store sensitive data in localStorage (only tokens)
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement CSRF protection when connecting to real backend

#### Authentication Security
- Implement token refresh mechanism
- Set token expiration times
- Clear tokens on logout
- Implement role-based access controls
- Use secure password policies

---

## 🚀 Getting Started (For Developers)

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Create a `.env` file in the root directory:
```env
# API Configuration (for future real backend)
VITE_API_BASE_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=ServiceHub
VITE_APP_ENV=development
```

### Development Workflow

1. **Start Dev Server**: `npm run dev`
2. **Open App**: http://localhost:5173
3. **Login**: Use demo credentials from AUTHENTICATION_UPGRADE.md
4. **Make Changes**: Hot-reload is enabled
5. **Test**: Test your changes with all three user roles
6. **Lint**: `npm run lint`
7. **Build**: `npm run build` before committing

---

## 📚 Additional Resources

### Project Documentation
- `README.md` - Basic project setup
- `AUTHENTICATION_UPGRADE.md` - Detailed auth system documentation
- `TECHNICAL_SPEC.md` - This document

### Key Dependencies Documentation
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router v7](https://reactrouter.com/en/main)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MSW (Mock Service Worker)](https://mswjs.io/)

---

## 🎯 Next Steps for Development

### Immediate Next Steps (Week 1-2)
1. **Backend: Implement automatic provider matching algorithm**
   - Match based on category, tier, location, and availability
   - Priority scoring system for provider selection
2. **Build provider notification system**
   - Push and in-app notifications for new assignments
3. **Implement provider accept/decline flow**
   - Accept assignment endpoint
   - Decline with reason functionality
4. **Add assignment timeout logic**
   - Auto-reassign if provider doesn't respond within timeframe

### Short Term (Week 3-4)
5. **Build request status tracking with assigned provider info**
   - Customer view of assigned provider details
   - Provider view of accepted assignments
6. **Implement real-time status updates**
   - WebSocket or polling for status changes
7. **Add provider qualification management**
   - Set which tiers provider is qualified for
   - Admin approval for tier upgrades
8. **Build review and rating system**
   - Post-completion reviews
   - Provider rating aggregation

### Medium Term (Month 2)
9. **Implement provider verification workflow**
   - Document upload and verification
   - Admin approval interface
10. **Build in-app messaging system**
    - Customer-provider communication
    - Message notifications
11. **Add file upload capabilities**
    - Service request images
    - Work completion photos
12. **Integrate geolocation services**
    - Address autocomplete
    - Distance-based matching priority

### Long Term (Month 3+)
13. **Create provider availability calendar**
    - Manage available/busy times
    - Integration with assignment system
14. **Add analytics dashboards**
    - Provider performance metrics
    - Platform usage statistics
15. **Implement email notifications**
    - Assignment notifications
    - Status update emails
16. **Build admin reporting tools**
    - Platform analytics
    - Provider performance reports
17. **Mobile app development**
    - React Native apps for iOS and Android

---

## 📞 Support & Contact

For questions about this specification or the platform development, please contact the development team.

---

## 📝 Document Change Log

### Version 1.1 - September 30, 2025
**Major Business Model Updates**:
- Removed provider browsing and selection - replaced with automatic backend matching
- Removed proposal/bidding system - replaced with fixed tier-based pricing
- Removed payment integration - payment handled outside platform
- Updated all workflows to reflect assignment-based model
- Added provider tier qualification system
- Updated data models to support automatic assignment flow

### Version 1.0 - September 30, 2025
- Initial technical specification created
- Complete documentation of existing implementation
- Feature roadmap and development guidelines

---

**Document Version**: 1.1  
**Last Updated**: September 30, 2025  
**Project Status**: Active Development (MVP Phase)  
**Business Model**: Service Coordination Platform (Assignment-Based)
