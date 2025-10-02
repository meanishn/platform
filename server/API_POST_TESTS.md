## API POST Requests — Postman Test Guide

Use this guide to quickly test all POST endpoints with example request bodies in Postman.

### Prerequisites
- Server running (default): `http://localhost:4000`
- Postman installed

### Postman Setup
1. Create an Environment in Postman with a variable:
   - `baseUrl` = `http://localhost:4000/api`
2. For endpoints requiring auth, set header:
   - `Authorization: Bearer {{jwt}}`
   - After login, set environment variable `jwt` to the returned token.

---

### 1) Register
- Method: POST
- URL: `{{baseUrl}}/auth/register`
- Body (JSON):
```json
{
  "email": "new.user@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User"
}
```
- Notes: `email` must be valid; `password` >= 3 chars

### 2) Login
- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):
```json
{
  "email": "new.user@example.com",
  "password": "password123"
}
```
- Response: Copy `data.token` to the `jwt` Postman environment variable.

---

### 3) Create Service Request (Customer)
- Method: POST
- URL: `{{baseUrl}}/service-requests`
- Headers:
  - `Authorization: Bearer {{jwt}}`
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "categoryId": 1,
  "tierId": 2,
  "title": "Leaky faucet repair",
  "description": "Kitchen sink faucet is leaking continuously.",
  "address": "123 Main St, Springfield",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "preferredDate": "2025-10-05T10:00:00.000Z",
  "urgency": "medium",
  "estimatedHours": 2,
  "images": [
    "https://example.com/image1.jpg"
  ]
}
```
- Required: `categoryId`, `tierId`, `title`, `description`, `address`, `latitude`, `longitude`
- Optional: `preferredDate` (ISO string), `urgency` (`low` | `medium` | `high`), `estimatedHours`, `images` (string[])
- Expected: `201 Created`

---

### 4) Create Review (Authenticated User)
- Method: POST
- URL: `{{baseUrl}}/reviews/:requestId`
  - Example: `{{baseUrl}}/reviews/123`
- Headers:
  - `Authorization: Bearer {{jwt}}`
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "rating": 5,
  "comment": "Excellent work and very professional.",
  "criteriaRatings": {
    "quality": 5,
    "timeliness": 5,
    "communication": 4
  },
  "isPublic": true
}
```
- Notes: `rating` typically 1–5; `criteriaRatings` keys are optional/flexible
- Expected: `201 Created`

---

### 5) Create Service Category (Admin)
- Method: POST
- URL: `{{baseUrl}}/service-categories/categories`
- Headers:
  - `Authorization: Bearer {{jwt}}` (admin account)
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "name": "Landscaping",
  "description": "Outdoor yard and garden services",
  "icon": "leaf"
}
```
- Expected: `201 Created`

### 6) Create Service Tier (Admin)
- Method: POST
- URL: `{{baseUrl}}/service-categories/tiers`
- Headers:
  - `Authorization: Bearer {{jwt}}` (admin account)
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "name": "Premium",
  "description": "Experienced providers with top ratings",
  "baseHourlyRate": 120,
  "categoryId": 1
}
```
- Expected: `201 Created`

---

---

### 7) Customer Confirms Provider (New Flow)
- Method: POST
- URL: `{{baseUrl}}/service-requests/:requestId/confirm`
  - Example: `{{baseUrl}}/service-requests/123/confirm`
- Headers:
  - `Authorization: Bearer {{jwt}}` (customer account)
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "providerId": 5
}
```
- Notes: Customer selects one provider from those who accepted. Other acceptances are removed.
- Expected: `200 OK`

---

### 8) Get Accepted Providers
- Method: GET
- URL: `{{baseUrl}}/service-requests/:requestId/accepted-providers`
  - Example: `{{baseUrl}}/service-requests/123/accepted-providers`
- Headers:
  - `Authorization: Bearer {{jwt}}` (customer account)
- Notes: 
  - While pending: returns list of providers (NO contact info)
  - After confirmation: returns only confirmed provider WITH contact info
- Expected: `200 OK`

---

### Quick Test Flow
1. Register (or login to a demo account from README) → save `token` as `jwt`.
2. Create Service Request as a customer.
3. Providers accept (PATCH `/api/providers/assignments/accept` with `{ "requestId": 123 }`).
4. Customer views accepted providers (GET endpoint above).
5. Customer confirms one provider (POST endpoint #7 above).
6. After completion, create Review for the request.

### Troubleshooting
- 401 Unauthorized: Ensure `Authorization` header is set and token is valid.
- 403 Forbidden: You may need an admin or approved provider account for that endpoint.
- 400 Validation error: Check required fields and data types (numbers vs strings).


