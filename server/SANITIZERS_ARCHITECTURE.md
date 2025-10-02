# Sanitizers Architecture

This document explains the domain-driven sanitizer architecture designed for scalability and maintainability.

## 🎯 Architecture Overview

Instead of a single monolithic `sanitize.ts` file, sanitizers are organized by domain:

```
src/sanitizers/
├── index.ts                    # Central export point
├── base.sanitizer.ts          # Common utilities
├── user.sanitizer.ts          # User domain
├── request.sanitizer.ts       # Service request domain
├── review.sanitizer.ts        # Review domain
└── notification.sanitizer.ts  # Notification domain
```

## 🏗️ Design Principles

### 1. Single Responsibility
Each sanitizer file handles **one domain** only:
- `user.sanitizer.ts` → User-related DTOs
- `request.sanitizer.ts` → Service request DTOs
- `review.sanitizer.ts` → Review DTOs
- `notification.sanitizer.ts` → Notification DTOs

### 2. Domain-Driven Design
Sanitizers are organized by business domain, not by technical layer. This makes it easy to:
- Find the right sanitizer
- Add new domains
- Maintain existing code

### 3. Reusability
Common utilities live in `base.sanitizer.ts` and are shared across all domain sanitizers.

### 4. Type Safety
All sanitizers are strongly typed with DTOs as return types.

## 📁 File Structure

### `base.sanitizer.ts` - Common Utilities

Provides shared utility functions:

```typescript
// Remove sensitive fields
export function removeSensitiveFields<T>(obj: T, fields?: string[]): Partial<T>

// Sanitize arrays
export function sanitizeArray<T, R>(items: T[], sanitizer: (item: T) => R): R[]

// Pick specific fields
export function pick<T, K>(obj: T, keys: K[]): Pick<T, K>

// Omit specific fields
export function omit<T, K>(obj: T, keys: K[]): Omit<T, K>

// Convert snake_case to camelCase
export function toCamelCase(str: string): string
export function objectToCamelCase<T>(obj: T): any
```

### `user.sanitizer.ts` - User Domain

Handles all user-related sanitization:

```typescript
// Own profile (authenticated user)
export function toAuthUserDto(user: User): AuthUserDto

// Public profile (safe for anyone)
export function toPublicUserDto(user: User): PublicUserDto

// Provider profile (no contact info)
export function toProviderProfileDto(user: User): ProviderProfileDto

// Provider with contact (confirmed assignments only)
export function toProviderWithContactDto(user: User): ProviderWithContactDto

// Array sanitizers
export function toPublicUserDtoArray(users: User[]): PublicUserDto[]
export function toProviderProfileDtoArray(users: User[]): ProviderProfileDto[]
export function toProviderWithContactDtoArray(users: User[]): ProviderWithContactDto[]
```

### `request.sanitizer.ts` - Service Request Domain

Handles all service request-related sanitization:

```typescript
// Basic request
export function toServiceRequestDto(request: ServiceRequest): ServiceRequestDto

// Request with relations
export function toServiceRequestDetailDto(request: ServiceRequest): ServiceRequestDetailDto

// List item (optimized)
export function toServiceRequestListItemDto(request: ServiceRequest): ServiceRequestListItemDto

// Categories and tiers
export function toServiceCategoryDto(category: ServiceCategory): ServiceCategoryDto
export function toServiceTierDto(tier: ServiceTier): ServiceTierDto

// Array sanitizers
export function toServiceRequestDtoArray(requests: ServiceRequest[]): ServiceRequestDto[]
export function toServiceRequestDetailDtoArray(requests: ServiceRequest[]): ServiceRequestDetailDto[]
export function toServiceRequestListItemDtoArray(requests: ServiceRequest[]): ServiceRequestListItemDto[]
export function toServiceCategoryDtoArray(categories: ServiceCategory[]): ServiceCategoryDto[]
export function toServiceTierDtoArray(tiers: ServiceTier[]): ServiceTierDto[]
```

### `review.sanitizer.ts` - Review Domain

Handles all review-related sanitization:

```typescript
// Basic review
export function toReviewDto(review: Review): ReviewDto

// Review with relations
export function toReviewDetailDto(review: Review): ReviewDetailDto

// Rating statistics
export function toProviderRatingStatsDto(stats: any): ProviderRatingStatsDto

// Array sanitizers
export function toReviewDtoArray(reviews: Review[]): ReviewDto[]
export function toReviewDetailDtoArray(reviews: Review[]): ReviewDetailDto[]
```

### `notification.sanitizer.ts` - Notification Domain

Handles all notification-related sanitization:

```typescript
// Basic notification
export function toNotificationDto(notification: Notification): NotificationDto

// Notification list with unread count
export function toNotificationListDto(
  notifications: Notification[],
  unreadCount: number
): NotificationListDto

// Array sanitizers
export function toNotificationDtoArray(notifications: Notification[]): NotificationDto[]
```

## 💡 Usage Examples

### Simple Import (Recommended)

```typescript
import { 
  toAuthUserDto, 
  toServiceRequestDto,
  toReviewDto 
} from '../sanitizers';
```

All sanitizers are exported from the central `index.ts` file.

### Domain-Specific Import

```typescript
import { toAuthUserDto } from '../sanitizers/user.sanitizer';
import { toServiceRequestDto } from '../sanitizers/request.sanitizer';
```

Use this if you want to be explicit about which domain you're using.

### Example: User Controller

```typescript
import { ResponseHelper } from '../utils/responseHelper';
import { toAuthUserDto, toPublicUserDto } from '../sanitizers';

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.query().findById(req.user!.id);
  
  // Own profile - includes personal info
  const userDto = toAuthUserDto(user);
  return ResponseHelper.success(res, userDto);
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.query().where('is_service_provider', true);
  
  // Public profiles - safe for listings
  const userDtos = users.map(toPublicUserDto);
  return ResponseHelper.success(res, userDtos);
};
```

### Example: Request Controller

```typescript
import { ResponseHelper } from '../utils/responseHelper';
import { 
  toServiceRequestDto, 
  toServiceRequestDetailDto,
  toServiceRequestListItemDtoArray 
} from '../sanitizers';

export const getRequest = async (req: Request, res: Response) => {
  const request = await ServiceRequest.query()
    .findById(req.params.id)
    .withGraphFetched('[user, category, tier, assignedProvider]');
  
  // Detailed view with relations
  const requestDto = toServiceRequestDetailDto(request);
  return ResponseHelper.success(res, requestDto);
};

export const getRequests = async (req: Request, res: Response) => {
  const requests = await ServiceRequest.query()
    .where('user_id', req.user!.id)
    .withGraphFetched('[category, tier]');
  
  // Optimized list view
  const requestDtos = toServiceRequestListItemDtoArray(requests);
  return ResponseHelper.success(res, requestDtos);
};
```

## 🔒 Security Best Practices

### 1. Never Return Raw Models
```typescript
// ❌ BAD - Can leak sensitive data
return ResponseHelper.success(res, user);

// ✅ GOOD - Sanitized DTO
return ResponseHelper.success(res, toAuthUserDto(user));
```

### 2. Use Appropriate DTOs for Context
```typescript
// Public listing - no contact info
const providers = users.map(toProviderProfileDto);

// Confirmed assignment - includes contact
const provider = toProviderWithContactDto(assignedProvider);
```

### 3. Always Include Required Relations
```typescript
// ❌ BAD - Will throw error
const dto = toServiceRequestDetailDto(request);

// ✅ GOOD - Fetch relations first
const request = await ServiceRequest.query()
  .findById(id)
  .withGraphFetched('[user, category, tier, assignedProvider]');
const dto = toServiceRequestDetailDto(request);
```

## 🚀 Adding New Sanitizers

### Step 1: Create Sanitizer File

```typescript
// src/sanitizers/payment.sanitizer.ts
import Payment from '../models/Payment';
import { PaymentDto } from '../shared/dtos/payment.dto';
import { sanitizeArray } from './base.sanitizer';

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    createdAt: payment.created_at
  };
}

export function toPaymentDtoArray(payments: Payment[]): PaymentDto[] {
  return sanitizeArray(payments, toPaymentDto);
}
```

### Step 2: Export from Index

```typescript
// src/sanitizers/index.ts
export * from './payment.sanitizer';
```

### Step 3: Use in Controllers

```typescript
import { toPaymentDto } from '../sanitizers';

const paymentDto = toPaymentDto(payment);
return ResponseHelper.success(res, paymentDto);
```

## 📊 Benefits Summary

### ✅ Before (Monolithic)
```
sanitize.ts (500+ lines)
├── User functions
├── Request functions
├── Review functions
├── Notification functions
└── Common utilities
```

**Problems:**
- Hard to find specific functions
- Large file to navigate
- Merge conflicts in team environment
- Unclear ownership

### ✅ After (Domain-Driven)
```
sanitizers/
├── base.sanitizer.ts (100 lines)
├── user.sanitizer.ts (100 lines)
├── request.sanitizer.ts (150 lines)
├── review.sanitizer.ts (70 lines)
└── notification.sanitizer.ts (40 lines)
```

**Benefits:**
- Easy to locate functions by domain
- Small, focused files
- Minimal merge conflicts
- Clear ownership by domain
- Easy to add new domains

## 🎯 Naming Conventions

### Function Names
- Singular: `toUserDto()` - converts one item
- Array: `toUserDtoArray()` - converts multiple items
- Specific: `toProviderWithContactDto()` - specific use case

### File Names
- Pattern: `{domain}.sanitizer.ts`
- Examples: `user.sanitizer.ts`, `payment.sanitizer.ts`

### Export Pattern
- Always export from `index.ts`
- Allows `import { ... } from '../sanitizers'`

## 📚 Related Documentation

- [Shared Types Architecture](./SHARED_TYPES_ARCHITECTURE.md)
- [Response Helper Guide](./QUICK_REFERENCE.md)
- [DTOs Reference](./src/shared/dtos/)

## 🔄 Migration Checklist

When refactoring controllers:

- [ ] Import from `../sanitizers` instead of `../utils/sanitize`
- [ ] Use domain-specific sanitizers
- [ ] Use ResponseHelper with sanitized DTOs
- [ ] Test endpoints after migration
- [ ] Update any service layer code

---

**Remember:** Keep sanitizers focused on their domain. If a sanitizer grows too large, consider splitting it into sub-domains.

