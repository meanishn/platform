# Quick Reference Guide

## 🚀 Using Response Helpers

```typescript
import { ResponseHelper } from '../utils/responseHelper';

// Success responses
return ResponseHelper.success(res, data);
return ResponseHelper.success(res, data, 'Operation successful');
return ResponseHelper.created(res, data, 'Resource created');

// Error responses
return ResponseHelper.error(res, 'Error message');
return ResponseHelper.unauthorized(res);
return ResponseHelper.forbidden(res, 'Access denied');
return ResponseHelper.notFound(res, 'Resource not found');
return ResponseHelper.conflict(res, 'Resource already exists');

// Validation errors
return ResponseHelper.validationError(
  res,
  ResponseHelper.formatValidationErrors(result.array())
);
```

## 🔒 Sanitizing Data

```typescript
import {
  toAuthUserDto,
  toPublicUserDto,
  toProviderProfileDto,
  toProviderWithContactDto,
  toServiceRequestDto,
  toServiceRequestDetailDto
} from '../sanitizers';

// User sanitization
const authUser = toAuthUserDto(user);           // Own profile
const publicUser = toPublicUserDto(user);       // Public listing
const provider = toProviderProfileDto(user);    // Provider profile
const withContact = toProviderWithContactDto(user); // With contact

// Request sanitization
const request = toServiceRequestDto(serviceRequest);
const detail = toServiceRequestDetailDto(serviceRequest); // With relations
```

## 📦 Using DTOs

```typescript
import {
  AuthResponseDto,
  PublicUserDto,
  ServiceRequestDto,
  CreateServiceRequestDto
} from '../shared/dtos';

// Type-safe responses
const authResponse: AuthResponseDto = {
  user: toAuthUserDto(user),
  token: generateToken(user)
};

// Type-safe request bodies
const createData: CreateServiceRequestDto = req.body;
```

## ✅ Complete Controller Example

```typescript
import { Request, Response } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import { toServiceRequestDto } from '../utils/sanitize';
import { ServiceRequestDto } from '../shared/dtos';

export const getRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return ResponseHelper.unauthorized(res);
    }
    
    const request = await requestService.getRequestDetails(
      parseInt(id),
      userId
    );
    
    if (!request) {
      return ResponseHelper.notFound(res, 'Request not found');
    }
    
    const requestDto: ServiceRequestDto = toServiceRequestDto(request);
    return ResponseHelper.success(res, requestDto);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    
    if (message.includes('Unauthorized')) {
      return ResponseHelper.forbidden(res, message);
    }
    
    return ResponseHelper.error(res, message);
  }
};
```

## 🎯 Common Patterns

### Pattern 1: List with Sanitization
```typescript
const users = await User.query().where('is_service_provider', true);
const userDtos = users.map(toPublicUserDto);
return ResponseHelper.success(res, userDtos);
```

### Pattern 2: Validation
```typescript
const result = validationResult(req);
if (!result.isEmpty()) {
  return ResponseHelper.validationError(
    res,
    ResponseHelper.formatValidationErrors(result.array())
  );
}
```

### Pattern 3: Auth Check
```typescript
if (!req.user?.id) {
  return ResponseHelper.unauthorized(res);
}

if (!req.user?.is_admin) {
  return ResponseHelper.forbidden(res, 'Admin access required');
}
```

### Pattern 4: Not Found
```typescript
const item = await Model.query().findById(id);
if (!item) {
  return ResponseHelper.notFound(res, 'Item not found');
}
```

### Pattern 5: Conflict
```typescript
const existing = await User.query().where('email', email).first();
if (existing) {
  return ResponseHelper.conflict(res, 'User already exists');
}
```

## 📋 Response Status Codes

| Method | Status | Use Case |
|--------|--------|----------|
| `success()` | 200 | Default success |
| `created()` | 201 | Resource created |
| `error()` | 400 | Bad request |
| `unauthorized()` | 401 | Not authenticated |
| `forbidden()` | 403 | Not authorized |
| `notFound()` | 404 | Resource not found |
| `conflict()` | 409 | Resource conflict |
| `serverError()` | 500 | Server error |

## 🔄 Migration Checklist

For each controller function:

- [ ] Import `ResponseHelper` and sanitizers
- [ ] Replace `res.json()` with `ResponseHelper.success()`
- [ ] Replace error responses with appropriate helpers
- [ ] Sanitize data before sending (use DTO converters)
- [ ] Add type annotations using DTOs
- [ ] Test the endpoint

## 📝 Standard Response Format

### Success
```json
{
  "success": true,
  "data": { /* sanitized DTO */ },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* validation errors */]
}
```

## 🛡️ Security Checklist

- ✅ Never send passwords
- ✅ Never send internal tokens
- ✅ Use appropriate DTO for context
- ✅ Don't expose email/phone except to authorized users
- ✅ Sanitize all user-generated content
- ✅ Validate all inputs

## 📚 File Locations

- DTOs: `src/shared/dtos/`
- Response types: `src/shared/types/responses.ts`
- Response helper: `src/utils/responseHelper.ts`
- Sanitizers: `src/sanitizers/` (domain-driven)
  - User: `src/sanitizers/user.sanitizer.ts`
  - Request: `src/sanitizers/request.sanitizer.ts`
  - Review: `src/sanitizers/review.sanitizer.ts`
  - Notification: `src/sanitizers/notification.sanitizer.ts`
  - Base utilities: `src/sanitizers/base.sanitizer.ts`
- Example: `src/controllers/authController.ts`

