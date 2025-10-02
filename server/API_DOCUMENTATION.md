# Utility Services Platform - API Documentation

## 🌐 API Overview

**Base URL**: `http://localhost:4000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```http
GET /auth/google
# Redirects to Google OAuth consent screen

GET /auth/google/callback
# Google OAuth callback
```

## 👤 User Profile Endpoints

### Get Current User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PATCH /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

## 🛠 Service Management Endpoints

### Get Service Categories
```http
GET /api/services/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Plumbing",
      "description": "Professional plumbing services",
      "icon": "plumbing",
      "tiers": [
        {
          "id": 1,
          "name": "Basic",
          "description": "Standard service",
          "base_hourly_rate": 35.00
        }
      ]
    }
  ]
}
```

### Get Category Tiers
```http
GET /api/services/categories/{categoryId}/tiers
```

## 🔧 Provider Endpoints

### Apply to Become Provider
```http
POST /api/providers/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryIds": [1, 2, 3],
  "bio": "Experienced electrician with 10+ years...",
  "skills": ["Electrical wiring", "Panel installations"],
  "certifications": [
    {
      "name": "Licensed Electrician",
      "issuer": "State Board",
      "year": 2015
    }
  ]
}
```

### Find Nearby Providers
```http
GET /api/providers/nearby?categoryId=1&latitude=40.7128&longitude=-74.0060&radius=50&minRating=4.0&isAvailable=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "firstName": "John",
      "lastName": "Smith",
      "averageRating": 4.8,
      "totalJobsCompleted": 147,
      "isAvailable": true,
      "providerCategories": [
        {
          "category": {
            "name": "Electrical",
            "icon": "electrical"
          },
          "isVerified": true
        }
      ]
    }
  ]
}
```

### Update Provider Availability
```http
PATCH /api/providers/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "isAvailable": true
}
```

### Get Provider Profile
```http
GET /api/providers/{providerId}/profile
```

## 📋 Service Request Endpoints

### Create Service Request
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": 1,
  "tierId": 2,
  "title": "Kitchen faucet repair",
  "description": "Leaking faucet in kitchen, needs immediate attention",
  "address": "123 Main St, City, State",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "preferredDate": "2024-01-15T14:00:00Z",
  "urgency": "medium",
  "estimatedHours": 2,
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "id": 456,
    "status": "pending",
    "expiresAt": "2024-01-14T14:00:00Z"
  }
}
```

### Get User's Requests
```http
GET /api/requests/my-requests?status=pending
Authorization: Bearer <token>
```

### Get Request Details
```http
GET /api/requests/{requestId}
Authorization: Bearer <token>
```

### Cancel Request
```http
PATCH /api/requests/{requestId}/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

## 💼 Proposal & Job Management

### Create Proposal (Provider)
```http
POST /api/requests/{requestId}/proposals
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I can fix this issue quickly and efficiently",
  "proposedRate": 60.00,
  "estimatedHours": 2.5,
  "availableFrom": "2024-01-15T10:00:00Z",
  "estimatedCompletion": "2024-01-15T16:00:00Z"
}
```

### Accept Proposal (Customer)
```http
PATCH /api/requests/{requestId}/proposals/{proposalId}/accept
Authorization: Bearer <token>
```

### Start Job (Provider)
```http
PATCH /api/requests/{requestId}/start
Authorization: Bearer <token>
```

### Complete Job (Provider)
```http
PATCH /api/requests/{requestId}/complete
Authorization: Bearer <token>
```

### Get Provider's Jobs
```http
GET /api/requests/my-jobs?status=accepted
Authorization: Bearer <token>
```

## ⭐ Review Endpoints

### Create Review
```http
POST /api/reviews/{requestId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent work! Very professional and timely.",
  "criteriaRatings": {
    "quality": 5,
    "timeliness": 4,
    "communication": 5,
    "professionalism": 5,
    "value": 4
  },
  "isPublic": true
}
```

### Get Provider Reviews
```http
GET /api/reviews/provider/{providerId}?limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 789,
        "rating": 5,
        "comment": "Excellent work!",
        "createdAt": "2024-01-15T10:00:00Z",
        "reviewer": {
          "firstName": "Jane",
          "lastName": "D."
        }
      }
    ],
    "total": 50,
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 50,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 3,
        "4": 16,
        "5": 30
      }
    }
  }
}
```

### Get Provider Rating Stats
```http
GET /api/reviews/provider/{providerId}/stats
```

### Check if User Can Review
```http
GET /api/reviews/request/{requestId}/can-review
Authorization: Bearer <token>
```

## 🔔 Notification Endpoints

### Get User Notifications
```http
GET /api/notifications?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 999,
      "type": "proposal_received",
      "title": "New Proposal Received",
      "message": "You received a new proposal for 'Kitchen faucet repair'",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z",
      "data": {
        "requestId": 456,
        "proposalId": 123
      }
    }
  ]
}
```

### Mark Notification as Read
```http
PATCH /api/notifications/{notificationId}/read
Authorization: Bearer <token>
```

### Mark All Notifications as Read
```http
PATCH /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

## 👑 Admin Endpoints

### Get Pending Provider Applications
```http
GET /api/providers/applications/pending
Authorization: Bearer <admin-token>
```

### Update Provider Status
```http
PATCH /api/providers/{providerId}/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved"
}
```

### Verify Provider Category
```http
PATCH /api/providers/{providerId}/categories/{categoryId}/verify
Authorization: Bearer <admin-token>
```

### Create Service Category
```http
POST /api/services/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "HVAC",
  "description": "Heating, ventilation, and air conditioning",
  "icon": "hvac"
}
```

### Create Service Tier
```http
POST /api/services/tiers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Premium",
  "description": "Top-tier service with specialized equipment",
  "baseHourlyRate": 85.00,
  "categoryId": 1
}
```

## 📊 Notification Types

| Type | Description | Recipients |
|------|-------------|------------|
| `new_request` | New service request posted | Nearby providers |
| `proposal_received` | Provider submitted proposal | Request owner |
| `proposal_accepted` | Customer accepted proposal | Provider |
| `job_started` | Job started by provider | Customer |
| `job_completed` | Job marked complete | Customer |
| `job_cancelled` | Job cancelled | Other party |
| `review_received` | New review posted | Provider |
| `provider_approved` | Provider application approved | Provider |
| `provider_rejected` | Provider application rejected | Provider |

## 🔒 Authentication & Authorization

### JWT Token Structure
```json
{
  "id": 123,
  "email": "user@example.com",
  "iat": 1642248000,
  "exp": 1642851200
}
```

### Authorization Levels
- **Public**: No authentication required
- **User**: Requires valid JWT token
- **Provider**: Requires approved provider status
- **Admin**: Requires admin privileges

### Error Responses
```json
{
  "success": false,
  "message": "Authentication required",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 📱 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔄 Request/Response Flow Example

### Complete Service Request Flow

1. **Customer creates request**
   ```http
   POST /api/requests
   ```

2. **Nearby providers get notified**
   ```json
   {
     "type": "new_request",
     "title": "New Service Request",
     "message": "New medium priority request: 'Kitchen faucet repair'"
   }
   ```

3. **Provider submits proposal**
   ```http
   POST /api/requests/456/proposals
   ```

4. **Customer gets notification**
   ```json
   {
     "type": "proposal_received",
     "title": "New Proposal Received"
   }
   ```

5. **Customer accepts proposal**
   ```http
   PATCH /api/requests/456/proposals/123/accept
   ```

6. **Provider starts job**
   ```http
   PATCH /api/requests/456/start
   ```

7. **Provider completes job**
   ```http
   PATCH /api/requests/456/complete
   ```

8. **Customer leaves review**
   ```http
   POST /api/reviews/456
   ```

This API provides a complete backend solution for the utility services platform with proper authentication, authorization, validation, and real-time updates.
