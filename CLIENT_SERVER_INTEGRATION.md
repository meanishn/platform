# Client-Server Integration Migration

This document outlines the changes made to integrate the client with the real server API instead of using MSW mocks.

## Changes Made

### 1. Shared Types Package
- Created `shared-types/` package with common TypeScript interfaces
- Extracted DTOs from server and made them available to both client and server
- Ensures type consistency between frontend and backend

### 2. Real API Service
- Created `client/src/services/realApi.ts` with actual server API calls
- Replaced MSW mock endpoints with real HTTP requests
- Added proper error handling and response parsing

### 3. Updated Authentication
- Modified `AuthContext` to use real server authentication endpoints
- Updated types to match server DTOs (`AuthUserDto`, `AuthResponseDto`)
- Maintained localStorage token persistence

### 4. Updated Components
- Modified `ServiceRequestForm` to use real API for categories, tiers, and request creation
- Updated `NotificationContext` to fetch real notifications from server
- Removed MSW dependency from `main.tsx`

### 5. Type System Updates
- Updated client types to re-export shared types
- Maintained backward compatibility with existing components
- Added proper TypeScript interfaces for all API responses

## Environment Setup

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ServiceHub
VITE_APP_ENV=development
```

## Server Requirements

Make sure the server is running on `http://localhost:3000` with the following endpoints available:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/verify` - Token verification
- `GET /api/service-categories/categories` - Get service categories
- `GET /api/service-categories/categories/:id/tiers` - Get category tiers
- `POST /api/service-requests` - Create service request
- `GET /api/notifications` - Get user notifications
- And other endpoints as defined in the server routes

## Testing the Integration

1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. Test authentication with demo credentials:
   - Admin: `admin@example.com` / `password`
   - Provider: `provider@example.com` / `password`
   - Customer: `customer@example.com` / `password`

## Key Differences from Mock Implementation

1. **Real Data Persistence**: Data is now stored in the database instead of localStorage
2. **Server-Side Validation**: All validation is handled by the server
3. **Real Authentication**: JWT tokens are validated against the server
4. **Database Relationships**: Proper foreign key relationships and data integrity
5. **Error Handling**: Real HTTP error responses instead of mock responses

## Next Steps

1. Test all user flows (login, registration, service requests, notifications)
2. Implement remaining API endpoints as needed
3. Add proper error boundaries and loading states
4. Consider adding offline support or retry mechanisms
5. Implement real-time updates (WebSocket or Server-Sent Events)
