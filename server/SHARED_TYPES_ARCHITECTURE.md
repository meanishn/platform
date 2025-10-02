# Shared Types Architecture

This document explains the shared types architecture designed to ensure type safety between client and server, prevent sensitive data leaks, and maintain consistent API responses.

## 📁 Directory Structure

```
src/
├── shared/                    # Types that can be shared with client
│   ├── types/
│   │   └── responses.ts       # Generic API response types
│   └── dtos/                  # Data Transfer Objects
│       ├── index.ts           # Exports all DTOs
│       ├── user.dto.ts        # User-related DTOs
│       ├── request.dto.ts     # Service request DTOs
│       ├── review.dto.ts      # Review DTOs
│       └── notification.dto.ts # Notification DTOs
├── sanitizers/                # Domain-driven sanitizers
│   ├── index.ts               # Central export point
│   ├── base.sanitizer.ts      # Common utilities
│   ├── user.sanitizer.ts      # User domain
│   ├── request.sanitizer.ts   # Service request domain
│   ├── review.sanitizer.ts    # Review domain
│   └── notification.sanitizer.ts # Notification domain
└── utils/
    └── responseHelper.ts      # Response formatting utilities
```

## 🎯 Key Concepts

### 1. Data Transfer Objects (DTOs)

DTOs define the exact shape of data sent to clients. They:
- **Exclude sensitive fields** (passwords, internal IDs, tokens)
- **Use camelCase** (client-friendly vs database snake_case)
- **Document the API contract** (what clients can expect)
- **Enable type sharing** (same types used in client TypeScript/React)

### 2. Sanitization

The `sanitizers/` directory contains domain-specific sanitizers that convert database models to DTOs:
- Removes sensitive fields
- Transforms field names
- Selects appropriate detail level based on context

### 3. Response Helpers

The `ResponseHelper` class provides consistent response formatting:
- Standard success/error structure
- HTTP status code helpers
- Validation error formatting

## 📋 Using the Architecture

### Step 1: Define DTOs (Already Done)

DTOs are defined in `src/shared/dtos/`. Example:

```typescript
// src/shared/dtos/user.dto.ts
export interface PublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  averageRating?: number;
  totalJobsCompleted: number;
  role: UserRole;
}

export interface ProviderWithContactDto extends PublicUserDto {
  email: string;    // Only for confirmed assignments
  phone?: string;   // Only for confirmed assignments
}
```

### Step 2: Use Sanitization Functions

Convert models to DTOs before sending responses:

```typescript
import { toPublicUserDto, toProviderWithContactDto } from '../sanitizers';
import User from '../models/User';

// For public listings
const publicUser = toPublicUserDto(user);

// For confirmed assignments (includes contact)
const providerWithContact = toProviderWithContactDto(provider);
```

### Step 3: Use Response Helpers

Replace manual JSON responses with helper methods:

```typescript
import { ResponseHelper } from '../utils/responseHelper';

// Before (inconsistent)
res.status(200).json({ success: true, data: user });
res.status(400).json({ success: false, message: 'Error' });

// After (consistent)
return ResponseHelper.success(res, userDto, 'User retrieved');
return ResponseHelper.error(res, 'Error message', 400);
```

## 🔒 Security Benefits

### 1. Prevent Sensitive Data Leaks

**Problem:** Accidentally exposing passwords, tokens, or internal data

**Solution:** Always use DTOs. Sensitive fields are never included.

```typescript
// ❌ BAD - Can leak password
res.json({ success: true, data: user });

// ✅ GOOD - Only safe fields
return ResponseHelper.success(res, toAuthUserDto(user));
```

### 2. Context-Appropriate Data

Different situations require different detail levels:

```typescript
// Public listing - minimal info
const providers = users.map(toPublicUserDto);

// Confirmed assignment - includes contact
const provider = toProviderWithContactDto(user);

// Own profile - full personal info (no password)
const profile = toAuthUserDto(user);
```

## 📦 Sharing Types with Client

### Option 1: Monorepo (Recommended)

```
project/
├── server/
│   └── src/
│       └── shared/    # Symlink or shared package
└── client/
    └── src/
        └── types/     # Import from shared
```

### Option 2: Copy Types

Copy `src/shared/` to your client project:

```bash
# In client project
cp -r ../server/src/shared ./src/types/shared
```

### Option 3: NPM Package

Publish `src/shared/` as a separate package:

```bash
npm publish @yourapp/shared-types
```

Then import in both projects:

```typescript
import { AuthUserDto, ApiResponse } from '@yourapp/shared-types';
```

## 🛠️ Example: Updated Controller

Here's how `authController.ts` now uses the architecture:

```typescript
import { ResponseHelper } from '../utils/responseHelper';
import { toAuthUserDto } from '../utils/sanitize';
import { AuthResponseDto } from '../shared/dtos';

export const register = async (req: Request, res: Response) => {
  // Validation
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return ResponseHelper.validationError(
      res,
      ResponseHelper.formatValidationErrors(result.array())
    );
  }
  
  // Business logic
  const existingUser = await getUser(email);
  if (existingUser) {
    return ResponseHelper.conflict(res, 'User already exists');
  }

  const user = await registerUser(email, password, firstName, lastName);
  const token = generateJwtForUser(user);
  
  // Sanitize and respond
  const authResponse: AuthResponseDto = {
    user: toAuthUserDto(user),  // NO PASSWORD included
    token
  };
  
  return ResponseHelper.created(res, authResponse, 'Registration successful');
};
```

## 📝 Response Helper Methods

### Success Responses

```typescript
ResponseHelper.success(res, data, message?, statusCode?)     // 200 OK
ResponseHelper.created(res, data, message?)                   // 201 Created
```

### Error Responses

```typescript
ResponseHelper.error(res, message, statusCode?, errors?)      // Generic error
ResponseHelper.validationError(res, errors, message?)        // 400 with validation errors
ResponseHelper.unauthorized(res, message?)                   // 401 Unauthorized
ResponseHelper.forbidden(res, message?)                      // 403 Forbidden
ResponseHelper.notFound(res, message?)                       // 404 Not Found
ResponseHelper.conflict(res, message?)                       // 409 Conflict
ResponseHelper.serverError(res, message?)                    // 500 Server Error
```

## 📊 Standard Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { /* DTO object */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [  // Optional validation errors
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "notanemail"
    }
  ]
}
```

## 🔄 Migration Guide

### Updating Existing Controllers

1. **Import utilities:**
```typescript
import { ResponseHelper } from '../utils/responseHelper';
import { toPublicUserDto, toServiceRequestDto } from '../utils/sanitize';
```

2. **Replace manual responses:**
```typescript
// Before
res.status(200).json({ success: true, data: request });

// After
return ResponseHelper.success(res, toServiceRequestDto(request));
```

3. **Use appropriate DTOs:**
```typescript
// For lists
const items = requests.map(toServiceRequestDto);

// For details with relations
const detail = toServiceRequestDetailDto(request);
```

## ✅ Benefits Summary

1. **Type Safety:** Client and server share the same type definitions
2. **Security:** Sensitive data never accidentally exposed
3. **Consistency:** All responses follow the same structure
4. **Maintainability:** Change once, update everywhere
5. **Documentation:** DTOs serve as API documentation
6. **Validation:** TypeScript catches mismatches at compile time

## 🚀 Next Steps

1. **Run migrations** for new `request_acceptances` table
2. **Update remaining controllers** to use ResponseHelper and sanitization
3. **Copy `src/shared/`** to your client project
4. **Use DTOs in client** for type-safe API calls
5. **Remove manual JSON responses** in favor of helpers

## 📚 Additional Resources

- See `src/controllers/authController.ts` for complete example
- See `src/utils/sanitize.ts` for all available sanitizers
- See `src/shared/dtos/` for all available DTOs

---

**Remember:** Never return raw database models directly to clients. Always use DTOs through sanitization functions.

