# Server-Side Endpoint Implementation Guidelines

> **Version:** 1.0  
> **Last Updated:** October 17, 2025  
> **Purpose:** Comprehensive guide for implementing and refactoring server endpoints

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [DTO Management](#dto-management)
4. [Implementation Workflow](#implementation-workflow)
5. [Controller Patterns](#controller-patterns)
6. [Service Patterns](#service-patterns)
7. [Sanitizer Usage](#sanitizer-usage)
8. [Response Formatting](#response-formatting)
9. [Error Handling](#error-handling)
10. [WebSocket Integration](#websocket-integration)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)
13. [Common Pitfalls](#common-pitfalls)
14. [Refactoring Checklist](#refactoring-checklist)

---

## Architecture Overview

Our server follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────┐
│           Client Request                │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │     Routes     │  (Routing & Validation)
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │   Controller   │  (Request/Response handling)
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │    Service     │  (Business Logic)
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Sanitizers    │  (Data transformation to DTOs)
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │     Models     │  (Database interaction)
       └────────────────┘
```

### Key Principles

1. **Single Source of Truth**: All DTOs are defined in shared types
2. **Separation of Concerns**: Each layer has a specific responsibility
3. **No Sensitive Data**: Sanitizers ensure no passwords, tokens, or internal IDs leak
4. **Type Safety**: TypeScript types align with runtime data structures
5. **DRY (Don't Repeat Yourself)**: No duplicate DTO mappers

---

## File Structure

### Directory Organization

```
server/src/
├── controllers/          # Request/response handlers
│   ├── authController.ts
│   ├── requestController.ts
│   └── reviewController.ts
│
├── services/            # Business logic
│   ├── authService.ts
│   ├── requestService.ts
│   └── reviewService.ts
│
├── sanitizers/          # Data sanitization (Model → DTO)
│   ├── index.ts        # Central export point
│   ├── base.sanitizer.ts
│   ├── user.sanitizer.ts
│   ├── request.sanitizer.ts
│   └── review.sanitizer.ts
│
├── routes/             # Route definitions
│   ├── index.ts       # Route aggregator
│   ├── authRoutes.ts
│   └── requestRoutes.ts
│
├── models/            # Database models (Objection.js)
│   ├── User.ts
│   └── ServiceRequest.ts
│
├── shared/            # Server-side DTOs
│   └── dtos/
│       ├── user.dto.ts
│       ├── request.dto.ts
│       └── review.dto.ts
│
└── middleware/        # Auth, validation, etc.
    └── authMiddleware.ts
```

### Shared Types (Root Level)

```
shared-types/          # Client & Server shared types
├── api.ts            # API response wrappers
├── user.ts           # User DTOs
├── service.ts        # Service request DTOs
├── review.ts         # Review DTOs
├── notification.ts   # Notification DTOs
└── index.ts          # Central export
```

---

## DTO Management

### DTO Placement Rules

#### ✅ **Shared Types** (`/shared-types/`)

**Use when:**
- DTO is used by **both client and server**
- Represents **public API contracts**
- Needs to be in sync across frontend/backend

**Example:**
```typescript
// shared-types/user.ts
export interface PublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  averageRating?: number;
  totalJobsCompleted?: number;
  role: UserRole;
}
```

#### ✅ **Server-Side DTOs** (`/server/src/shared/dtos/`)

**Use when:**
- DTO is used **only by server** (re-exported from shared-types)
- Provides server-side type definitions that mirror shared-types
- Used for internal consistency

**Example:**
```typescript
// server/src/shared/dtos/user.dto.ts
export * from '../../../../shared-types/user';
```

### DTO Naming Conventions

| Type | Suffix | Example | Purpose |
|------|--------|---------|---------|
| Basic DTO | `Dto` | `UserDto` | Basic entity data |
| Detailed DTO | `DetailDto` | `ServiceRequestDetailDto` | Includes relations |
| List Item | `ListItemDto` | `ServiceRequestListItemDto` | Optimized for lists |
| Public Profile | `ProfileDto` | `ProviderProfileDto` | Public-facing data |
| With Contact | `WithContactDto` | `ProviderWithContactDto` | Includes contact info |
| Response Wrapper | `Response` | `ReviewsListResponse` | API response wrapper |
| Create Payload | `CreateDto` | `CreateReviewDto` | Create operation input |
| Update Payload | `UpdateDto` | `UpdateProfileDto` | Update operation input |

### DTO Evolution Example

```typescript
// 1. Base DTO (minimal fields)
export interface ServiceRequestDto {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  // ... basic fields only
}

// 2. Detail DTO (includes relations)
export interface ServiceRequestDetailDto extends ServiceRequestDto {
  customer: PublicUserDto | CustomerWithContactDto;
  category: ServiceCategoryDto;
  tier: ServiceTierDto;
  assignedProvider?: ProviderWithContactDto;
}

// 3. List Item DTO (optimized for lists)
export interface ServiceRequestListItemDto {
  id: number;
  title: string;
  status: RequestStatus;
  createdAt: string;
  completedAt?: string;
  category: {
    id: number;
    name: string;
    icon?: string;
  };
  tier: {
    id: number;
    name: string;
    baseHourlyRate: number;
  };
}
```

---

## Implementation Workflow

### Creating a New Endpoint

#### Step 1: Define DTOs in Shared Types

```typescript
// shared-types/yourFeature.ts
export interface YourFeatureDto {
  id: number;
  name: string;
  createdAt: string;
  // NO sensitive fields (passwords, internal IDs, etc.)
}

export interface YourFeatureDetailDto extends YourFeatureDto {
  relatedData: RelatedDto;
  // Additional fields for detail view
}
```

#### Step 2: Create Server-Side DTO Mirror

```typescript
// server/src/shared/dtos/yourFeature.dto.ts
export * from '../../../../shared-types/yourFeature';
```

#### Step 3: Create Sanitizer Functions

```typescript
// server/src/sanitizers/yourFeature.sanitizer.ts
import YourFeatureModel from '../models/YourFeature';
import { YourFeatureDto, YourFeatureDetailDto } from '../shared/dtos/yourFeature.dto';
import { sanitizeArray } from './base.sanitizer';

/**
 * Convert YourFeature model to DTO
 */
export function toYourFeatureDto(model: YourFeatureModel | any): YourFeatureDto {
  return {
    id: model.id,
    name: model.name,
    createdAt: model.created_at,
    // Transform snake_case to camelCase
    // Parse JSON fields if needed
    // NEVER include sensitive fields
  };
}

/**
 * Convert with relations to detail DTO
 */
export function toYourFeatureDetailDto(model: YourFeatureModel | any): YourFeatureDetailDto {
  return {
    ...toYourFeatureDto(model),
    relatedData: toRelatedDto(model.relatedData),
  };
}

/**
 * Sanitize array
 */
export function toYourFeatureDtoArray(models: YourFeatureModel[]): YourFeatureDto[] {
  return sanitizeArray(models, toYourFeatureDto);
}
```

#### Step 4: Export from Sanitizer Index

```typescript
// server/src/sanitizers/index.ts
export * from './yourFeature.sanitizer';
```

#### Step 5: Create Service Methods

```typescript
// server/src/services/yourFeatureService.ts
import YourFeatureModel from '../models/YourFeature';
import { 
  toYourFeatureDto, 
  toYourFeatureDetailDto,
  toYourFeatureDtoArray
} from '../sanitizers';
import type { YourFeatureDto, YourFeatureDetailDto } from '../../../shared-types';

export class YourFeatureService {
  
  async create(data: CreateYourFeatureData): Promise<YourFeatureDto> {
    const model = await YourFeatureModel.query().insertAndFetch({
      name: data.name,
      // ... map fields
    });
    
    return toYourFeatureDto(model);  // ✅ Use sanitizer
  }
  
  async getById(id: number): Promise<YourFeatureDetailDto | null> {
    const model = await YourFeatureModel.query()
      .findById(id)
      .withGraphFetched('[relatedData]');
    
    if (!model) return null;
    
    return toYourFeatureDetailDto(model);  // ✅ Use sanitizer
  }
  
  async getAll(): Promise<YourFeatureDto[]> {
    const models = await YourFeatureModel.query();
    return toYourFeatureDtoArray(models);  // ✅ Use sanitizer
  }
}

export const yourFeatureService = new YourFeatureService();
```

#### Step 6: Create Controller

```typescript
// server/src/controllers/yourFeatureController.ts
import { Request, Response } from 'express';
import { yourFeatureService } from '../services/yourFeatureService';

export class YourFeatureController {
  
  /**
   * Create new feature
   * POST /api/your-feature
   */
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const data = req.body;
      const feature = await yourFeatureService.create(data);

      res.status(201).json({
        success: true,
        message: 'Feature created successfully',
        data: feature  // Already sanitized by service
      });
    } catch (error) {
      console.error('Error creating feature:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Creation failed'
      });
    }
  };

  /**
   * Get feature by ID
   * GET /api/your-feature/:id
   */
  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const feature = await yourFeatureService.getById(parseInt(id));

      if (!feature) {
        return res.status(404).json({ 
          success: false, 
          message: 'Feature not found' 
        });
      }

      res.json({
        success: true,
        data: feature  // Already sanitized by service
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get feature'
      });
    }
  };

  /**
   * Get all features
   * GET /api/your-feature
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const features = await yourFeatureService.getAll();

      res.json({
        success: true,
        data: features  // Already sanitized by service
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get features'
      });
    }
  };
}

export const yourFeatureController = new YourFeatureController();
```

#### Step 7: Create Routes

```typescript
// server/src/routes/yourFeatureRoutes.ts
import { Router } from 'express';
import { yourFeatureController } from '../controllers/yourFeatureController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, yourFeatureController.create);
router.get('/', requireAuth, yourFeatureController.getAll);
router.get('/:id', requireAuth, yourFeatureController.getById);

export { router as yourFeatureRoutes };
```

#### Step 8: Register Routes

```typescript
// server/src/routes/index.ts
import { yourFeatureRoutes } from './yourFeatureRoutes';

router.use('/api/your-feature', yourFeatureRoutes);
```

---

## Controller Patterns

### ✅ Good Controller Pattern

```typescript
export class GoodController {
  /**
   * Method name describes action clearly
   * Includes JSDoc with HTTP method and route
   */
  createResource = async (req: Request, res: Response) => {
    try {
      // 1. Authentication check
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      // 2. Input validation (can also use middleware)
      const { requiredField } = req.body;
      if (!requiredField) {
        return res.status(400).json({ 
          success: false, 
          message: 'requiredField is required' 
        });
      }

      // 3. Call service (business logic)
      const resource = await service.createResource(data);

      // 4. Emit WebSocket events (if applicable)
      emitToUser(userId, SocketEvents.RESOURCE_CREATED, {
        resourceId: resource.id
      });

      // 5. Return success response
      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: resource  // Already sanitized by service
      });
    } catch (error) {
      // 6. Error handling
      console.error('Error creating resource:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Creation failed'
      });
    }
  };
}
```

### ❌ Bad Controller Pattern

```typescript
export class BadController {
  // ❌ No JSDoc, unclear method name
  doStuff = async (req: Request, res: Response) => {
    // ❌ No authentication check
    
    // ❌ Business logic in controller
    const model = await Model.query().insert({
      name: req.body.name
    });

    // ❌ No sanitization, raw model data exposed
    res.json({ data: model });
    
    // ❌ No error handling
  };
}
```

### Controller Responsibilities

**Controllers SHOULD:**
- ✅ Handle HTTP request/response
- ✅ Validate authentication/authorization
- ✅ Extract request parameters
- ✅ Call service methods
- ✅ Format responses consistently
- ✅ Handle errors gracefully
- ✅ Emit WebSocket events

**Controllers SHOULD NOT:**
- ❌ Contain business logic
- ❌ Directly access database models
- ❌ Transform data (use sanitizers)
- ❌ Contain complex computations

---

## Service Patterns

### ✅ Good Service Pattern

```typescript
import { toResourceDto } from '../sanitizers';
import type { ResourceDto } from '../../../shared-types';

export class GoodService {
  
  async createResource(data: CreateResourceData): Promise<ResourceDto> {
    // 1. Validation & business logic
    await this.validateBusinessRules(data);
    
    // 2. Database operations
    const model = await ResourceModel.query().insertAndFetch({
      name: data.name,
      user_id: data.userId,
      // ... map fields
    });
    
    // 3. Side effects (notifications, etc.)
    await notificationService.notifyResourceCreated(model.id);
    
    // 4. Return sanitized DTO
    return toResourceDto(model);
  }
  
  async getById(id: number): Promise<ResourceDto | null> {
    // 1. Fetch with relations
    const model = await ResourceModel.query()
      .findById(id)
      .withGraphFetched('[relatedData]');
    
    if (!model) return null;
    
    // 2. Return sanitized DTO
    return toResourceDto(model);
  }
  
  private async validateBusinessRules(data: CreateResourceData): Promise<void> {
    // Business validation logic
    if (data.amount < 0) {
      throw new Error('Amount must be positive');
    }
  }
}
```

### ❌ Bad Service Pattern

```typescript
export class BadService {
  
  async create(data: any) {  // ❌ No type safety
    // ❌ No validation
    
    const model = await Model.query().insert(data);
    
    // ❌ Returns raw model (snake_case, possibly sensitive data)
    return model;
  }
}
```

### Service Responsibilities

**Services SHOULD:**
- ✅ Contain business logic
- ✅ Orchestrate database operations
- ✅ Validate business rules
- ✅ Handle transactions
- ✅ Call other services
- ✅ Return sanitized DTOs
- ✅ Be testable (dependency injection)

**Services SHOULD NOT:**
- ❌ Handle HTTP requests/responses
- ❌ Return raw database models
- ❌ Contain DTO mapping logic (use sanitizers)

---

## Sanitizer Usage

### Purpose of Sanitizers

1. **Transform database models to DTOs** (snake_case → camelCase)
2. **Remove sensitive data** (passwords, tokens, internal IDs)
3. **Parse JSON fields** (strings → objects/arrays)
4. **Ensure type consistency** (undefined vs null)
5. **Single source of truth** for data transformation

### Sanitizer Structure

```typescript
// server/src/sanitizers/example.sanitizer.ts
import ExampleModel from '../models/Example';
import { ExampleDto, ExampleDetailDto } from '../shared/dtos/example.dto';
import { sanitizeArray } from './base.sanitizer';
import { toRelatedDto } from './related.sanitizer';

/**
 * Convert Example model to basic DTO
 */
export function toExampleDto(model: ExampleModel | any): ExampleDto {
  // Parse JSON fields if needed
  let tags: string[] = [];
  if (model.tags) {
    try {
      tags = typeof model.tags === 'string' 
        ? JSON.parse(model.tags) 
        : model.tags;
    } catch {
      tags = [];
    }
  }

  return {
    // Transform field names
    id: model.id,
    userId: model.user_id,
    name: model.name,
    tags,
    
    // Convert dates
    createdAt: model.created_at,
    updatedAt: model.updated_at,
    
    // NEVER include sensitive fields:
    // ❌ password: model.password_hash
    // ❌ internalToken: model.internal_token
  };
}

/**
 * Convert with relations to detail DTO
 */
export function toExampleDetailDto(model: ExampleModel | any): ExampleDetailDto {
  if (!model.relatedData) {
    throw new Error('Example must include relatedData relation');
  }

  return {
    ...toExampleDto(model),
    relatedData: toRelatedDto(model.relatedData),
  };
}

/**
 * Sanitize array of examples
 */
export function toExampleDtoArray(models: ExampleModel[]): ExampleDto[] {
  return sanitizeArray(models, toExampleDto);
}
```

### Progressive Disclosure Pattern

For sensitive data that should only be shown in certain contexts:

```typescript
/**
 * Convert User to DTO with progressive disclosure
 * @param model - User model
 * @param includeContact - Whether to include contact information
 */
export function toUserDto(
  model: User | any, 
  includeContact = false
): PublicUserDto | UserWithContactDto {
  
  const baseDto: PublicUserDto = {
    id: model.id,
    firstName: model.first_name,
    lastName: model.last_name,
    profileImage: model.profile_image,
    averageRating: model.average_rating,
    role: model.role,
  };
  
  // Add contact info only when authorized
  if (includeContact) {
    return {
      ...baseDto,
      email: model.email,
      phone: model.phone,
    } as UserWithContactDto;
  }
  
  return baseDto;
}
```

### When to Create a Sanitizer

Create a sanitizer function when:
- ✅ Converting a database model to a DTO
- ✅ Data needs field name transformation (snake_case → camelCase)
- ✅ JSON parsing is required
- ✅ Sensitive data must be removed
- ✅ Data is sent to the client

**Do NOT create sanitizers for:**
- ❌ Simple type conversions (use TypeScript)
- ❌ Input validation (use validators)
- ❌ Business logic (use services)

---

## Response Formatting

### Standard Response Format

All API responses should follow this structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}
```

### Success Responses

```typescript
// 200 OK - GET request
res.json({
  success: true,
  data: sanitizedData
});

// 201 Created - POST request
res.status(201).json({
  success: true,
  message: 'Resource created successfully',
  data: sanitizedData
});

// 204 No Content - DELETE request
res.status(204).send();
```

### Error Responses

```typescript
// 400 Bad Request
res.status(400).json({
  success: false,
  message: 'Invalid input data',
  errors: validationErrors  // Optional
});

// 401 Unauthorized
res.status(401).json({
  success: false,
  message: 'Authentication required'
});

// 403 Forbidden
res.status(403).json({
  success: false,
  message: 'You do not have permission to access this resource'
});

// 404 Not Found
res.status(404).json({
  success: false,
  message: 'Resource not found'
});

// 409 Conflict
res.status(409).json({
  success: false,
  message: 'Resource already exists or is in conflicting state'
});

// 500 Internal Server Error
res.status(500).json({
  success: false,
  message: 'Internal server error'
});
```

---

## Error Handling

### Controller Error Handling

```typescript
methodName = async (req: Request, res: Response) => {
  try {
    // ... operation
  } catch (error) {
    // Log error for debugging
    console.error('Error in methodName:', error);
    
    // Determine appropriate status code
    const message = error instanceof Error ? error.message : 'Operation failed';
    const status = 
      message.includes('not found') ? 404 :
      message.includes('unauthorized') ? 403 :
      message.includes('conflict') ? 409 :
      400;
    
    res.status(status).json({
      success: false,
      message
    });
  }
};
```

### Service Error Handling

```typescript
async methodName(id: number): Promise<ResourceDto> {
  const resource = await Model.query().findById(id);
  
  if (!resource) {
    throw new Error('Resource not found');  // Controller will catch and set 404
  }
  
  if (!this.canAccess(resource)) {
    throw new Error('Unauthorized to access this resource');  // Controller sets 403
  }
  
  return toResourceDto(resource);
}
```

---

## WebSocket Integration

### When to Emit WebSocket Events

Emit events for:
- ✅ Real-time updates (status changes)
- ✅ Notifications (new messages, assignments)
- ✅ Progress updates (long-running operations)
- ✅ Collaborative features (multiple users)

### WebSocket Pattern

```typescript
import { emitToUser, emitToRole, SocketEvents } from '../services/socketService';

// Emit to specific user
emitToUser(userId, SocketEvents.REQUEST_UPDATED, {
  requestId: request.id,
  status: request.status,
  timestamp: new Date().toISOString()
});

// Emit to all users with a role
emitToRole('provider', SocketEvents.NEW_REQUEST, {
  requestId: request.id,
  categoryId: request.categoryId,
  urgency: request.urgency
});

// Emit to multiple users
[customerId, providerId].forEach(userId => {
  emitToUser(userId, SocketEvents.STATUS_CHANGED, data);
});
```

### Socket Event Naming

```typescript
// SocketEvents enum
export enum SocketEvents {
  // Use PAST_TENSE or NOUN_ACTION format
  REQUEST_CREATED = 'request:created',
  REQUEST_STATUS_CHANGED = 'request:status_changed',
  PROVIDER_ACCEPTED = 'provider:accepted',
  NOTIFICATION_RECEIVED = 'notification:received',
}
```

---

## Security Considerations

### 1. Never Expose Sensitive Data

```typescript
// ❌ BAD
return {
  id: user.id,
  email: user.email,
  passwordHash: user.password_hash,  // ❌ NEVER!
  internalToken: user.internal_token  // ❌ NEVER!
};

// ✅ GOOD
return {
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  profileImage: user.profile_image
};
```

### 2. Always Validate Authorization

```typescript
// ✅ Check if user owns the resource
const resource = await Model.query().findById(id);
if (resource.user_id !== req.user?.id) {
  throw new Error('Unauthorized to access this resource');
}

// ✅ Check role-based permissions
if (!req.user?.isAdmin) {
  throw new Error('Admin access required');
}

// ✅ Check provider approval status
if (!req.user?.isApprovedProvider) {
  throw new Error('Approved provider access required');
}
```

### 3. Sanitize All Outputs

```typescript
// ❌ BAD - Returns raw model
const user = await User.query().findById(id);
return user;

// ✅ GOOD - Returns sanitized DTO
const user = await User.query().findById(id);
return toPublicUserDto(user);
```

### 4. Validate All Inputs

```typescript
// Use express-validator or custom validation
const { validationResult } = require('express-validator');

const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ 
    success: false, 
    errors: errors.array() 
  });
}
```

---

## Testing

### Unit Test Structure

```typescript
// __tests__/services/exampleService.test.ts
describe('ExampleService', () => {
  describe('create', () => {
    it('should create resource and return DTO', async () => {
      // Arrange
      const input = { name: 'Test' };
      
      // Act
      const result = await exampleService.create(input);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test');
      expect(result).not.toHaveProperty('password_hash');
    });
    
    it('should throw error for invalid input', async () => {
      // Arrange
      const input = { name: '' };
      
      // Act & Assert
      await expect(exampleService.create(input))
        .rejects
        .toThrow('Name is required');
    });
  });
});
```

### Integration Test Structure

```typescript
// __tests__/controllers/exampleController.test.ts
describe('Example Controller', () => {
  describe('POST /api/example', () => {
    it('should create resource and return 201', async () => {
      const response = await request(app)
        .post('/api/example')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
    
    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post('/api/example')
        .send({ name: 'Test' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Duplicate DTO Mappers

**Problem:**
```typescript
// ❌ In service file
function toResourceDto(model) { /* ... */ }

// ❌ Also in sanitizer file
export function toResourceDto(model) { /* ... */ }
```

**Solution:**
```typescript
// ✅ Only in sanitizer file
export function toResourceDto(model) { /* ... */ }

// ✅ Service imports and uses it
import { toResourceDto } from '../sanitizers';
```

---

### ❌ Pitfall 2: Returning Raw Models

**Problem:**
```typescript
// ❌ Controller returns raw model
async getUser(req, res) {
  const user = await User.query().findById(id);
  res.json({ data: user });  // Snake_case, may include password_hash!
}
```

**Solution:**
```typescript
// ✅ Service returns sanitized DTO
async getUser(id: number): Promise<UserDto> {
  const user = await User.query().findById(id);
  return toUserDto(user);  // Sanitized, camelCase, no sensitive data
}
```

---

### ❌ Pitfall 3: Business Logic in Controllers

**Problem:**
```typescript
// ❌ Controller has business logic
async createRequest(req, res) {
  // ❌ Complex calculations in controller
  const price = calculatePrice(req.body);
  const eligibleProviders = await findProviders(req.body);
  
  const request = await ServiceRequest.query().insert({...});
  res.json({ data: request });
}
```

**Solution:**
```typescript
// ✅ Business logic in service
async createRequest(req, res) {
  const request = await requestService.create(req.body);
  res.json({ data: request });
}

// Service handles complexity
async create(data): Promise<ServiceRequestDto> {
  const price = this.calculatePrice(data);
  const eligibleProviders = await this.findEligibleProviders(data);
  // ... more business logic
}
```

---

### ❌ Pitfall 4: Missing Error Handling

**Problem:**
```typescript
// ❌ No try-catch
async createResource(req, res) {
  const resource = await service.create(req.body);
  res.json({ data: resource });
}
```

**Solution:**
```typescript
// ✅ Proper error handling
async createResource(req, res) {
  try {
    const resource = await service.create(req.body);
    res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Creation failed'
    });
  }
}
```

---

### ❌ Pitfall 5: Inconsistent Response Format

**Problem:**
```typescript
// ❌ Different response formats
res.json({ resource: data });           // Sometimes 'resource'
res.json({ data: data });               // Sometimes 'data'
res.json({ result: data, ok: true });   // Sometimes 'result' and 'ok'
```

**Solution:**
```typescript
// ✅ Consistent format
res.json({ success: true, data: data });
res.json({ success: false, message: 'Error occurred' });
```

---

## Refactoring Checklist

When refactoring an existing endpoint, follow this checklist:

### Step 1: Analyze Current Implementation

- [ ] Identify all DTOs used
- [ ] Find where data transformation happens
- [ ] Check for duplicate mapper functions
- [ ] Review error handling
- [ ] Check for sensitive data exposure

### Step 2: Update DTOs

- [ ] Ensure DTOs are in `shared-types/`
- [ ] Verify server-side DTO mirrors exist
- [ ] Add missing fields to DTOs
- [ ] Document DTO purpose and usage

### Step 3: Create/Update Sanitizers

- [ ] Create sanitizer functions in `server/src/sanitizers/`
- [ ] Remove duplicate mappers from service files
- [ ] Export sanitizers from `sanitizers/index.ts`
- [ ] Handle JSON parsing, snake_case → camelCase
- [ ] Remove sensitive data

### Step 4: Update Service Layer

- [ ] Import sanitizers from `../sanitizers`
- [ ] Replace inline mappers with sanitizer calls
- [ ] Ensure all methods return DTOs
- [ ] Add proper error handling
- [ ] Add JSDoc comments

### Step 5: Update Controller Layer

- [ ] Import sanitizers (if needed)
- [ ] Ensure consistent response format
- [ ] Add proper error handling
- [ ] Add authentication checks
- [ ] Add JSDoc with HTTP method and route
- [ ] Emit WebSocket events if applicable

### Step 6: Testing

- [ ] Run linter: `npm run lint`
- [ ] Compile TypeScript: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Test endpoints manually with Postman/curl
- [ ] Verify no sensitive data in responses
- [ ] Check WebSocket events work

### Step 7: Documentation

- [ ] Update API documentation
- [ ] Add JSDoc comments
- [ ] Update shared-types if needed
- [ ] Document breaking changes

---

## Quick Reference

### File Creation Order

1. Define DTOs in `shared-types/`
2. Create sanitizers in `server/src/sanitizers/`
3. Create service in `server/src/services/`
4. Create controller in `server/src/controllers/`
5. Create routes in `server/src/routes/`
6. Register routes in `server/src/routes/index.ts`

### Import Patterns

```typescript
// Shared types (for type annotations)
import type { UserDto } from '../../../shared-types';

// Sanitizers (for data transformation)
import { toUserDto } from '../sanitizers';

// Services (business logic)
import { userService } from '../services/userService';

// Models (database)
import User from '../models/User';
```

### Response Template

```typescript
try {
  // ... operation
  res.json({
    success: true,
    message: 'Operation successful',  // Optional
    data: sanitizedData
  });
} catch (error) {
  console.error('Error:', error);
  res.status(400).json({
    success: false,
    message: error instanceof Error ? error.message : 'Operation failed'
  });
}
```

---

## Examples from Codebase

### ✅ Good Example: Review Controller

```typescript
// server/src/controllers/reviewController.ts
import { toReviewDetailDto, toReviewDetailDtoArray } from '../sanitizers/review.sanitizer';

async getUserReviews(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const result = await reviewService.getUserReviews(parseInt(userId));
    
    // Service returns pre-sanitized data
    res.json({
      success: true,
      data: {
        reviews: result.reviews,  // Already DTOs
        total: result.total,
        stats: result.stats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get reviews'
    });
  }
}
```

### ✅ Good Example: Request Service

```typescript
// server/src/services/requestService.ts
import { 
  toServiceRequestDto,
  toServiceRequestDetailDto
} from '../sanitizers';

async createRequest(data: CreateRequestData): Promise<ServiceRequestDto> {
  const request = await ServiceRequest.query().insertAndFetch({
    user_id: data.userId,
    title: data.title,
    // ... map fields
  });

  // Always return sanitized DTO
  return toServiceRequestDto(request);
}
```

---

## Conclusion

Following these guidelines ensures:

1. ✅ **Consistency** across the codebase
2. ✅ **Type safety** between client and server
3. ✅ **Security** with no sensitive data leaks
4. ✅ **Maintainability** with single source of truth
5. ✅ **Scalability** with clear separation of concerns

When in doubt, refer to existing well-implemented endpoints like `reviewController` and `reviewService` as examples.

---

**Questions or suggestions?** Update this document as patterns evolve!

