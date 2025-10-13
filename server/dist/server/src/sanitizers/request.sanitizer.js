"use strict";
/**
 * Request Sanitizer
 * Handles all service request-related data sanitization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toServiceRequestDto = toServiceRequestDto;
exports.toServiceRequestDetailDto = toServiceRequestDetailDto;
exports.toServiceRequestListItemDto = toServiceRequestListItemDto;
exports.toServiceCategoryDto = toServiceCategoryDto;
exports.toServiceTierDto = toServiceTierDto;
exports.toServiceRequestDtoArray = toServiceRequestDtoArray;
exports.toServiceRequestDetailDtoArray = toServiceRequestDetailDtoArray;
exports.toServiceRequestListItemDtoArray = toServiceRequestListItemDtoArray;
exports.toServiceCategoryDtoArray = toServiceCategoryDtoArray;
exports.toServiceTierDtoArray = toServiceTierDtoArray;
const base_sanitizer_1 = require("./base.sanitizer");
const user_sanitizer_1 = require("./user.sanitizer");
/**
 * Convert ServiceRequest model to ServiceRequestDto
 */
function toServiceRequestDto(request) {
    return {
        id: request.id,
        userId: request.user_id,
        categoryId: request.category_id,
        tierId: request.tier_id,
        title: request.title,
        description: request.description,
        address: request.address,
        latitude: request.latitude,
        longitude: request.longitude,
        preferredDate: request.preferred_date,
        urgency: request.urgency,
        estimatedHours: request.estimated_hours,
        images: request.images,
        status: request.status,
        assignedProviderId: request.assigned_provider_id,
        assignedAt: request.assigned_at,
        startedAt: request.started_at,
        completedAt: request.completed_at,
        createdAt: request.created_at,
        updatedAt: request.updated_at
    };
}
/**
 * Convert ServiceRequest with relations to ServiceRequestDetailDto
 * Includes customer, category, tier, and assigned provider (if any)
 */
function toServiceRequestDetailDto(request) {
    if (!request.user || !request.category || !request.tier) {
        throw new Error('Request must include user, category, and tier relations');
    }
    return Object.assign(Object.assign({}, toServiceRequestDto(request)), { customer: (0, user_sanitizer_1.toPublicUserDto)(request.user), category: toServiceCategoryDto(request.category), tier: toServiceTierDto(request.tier), assignedProvider: request.assignedProvider
            ? (0, user_sanitizer_1.toProviderWithContactDto)(request.assignedProvider)
            : undefined });
}
/**
 * Convert ServiceRequest to list item DTO (optimized for lists)
 */
function toServiceRequestListItemDto(request) {
    var _a, _b, _c, _d, _e, _f;
    return {
        id: request.id,
        title: request.title,
        description: request.description,
        address: request.address,
        status: request.status,
        urgency: request.urgency,
        estimatedHours: request.estimated_hours,
        preferredDate: request.preferred_date,
        createdAt: request.created_at,
        category: {
            id: ((_a = request.category) === null || _a === void 0 ? void 0 : _a.id) || request.category_id,
            name: ((_b = request.category) === null || _b === void 0 ? void 0 : _b.name) || '',
            icon: (_c = request.category) === null || _c === void 0 ? void 0 : _c.icon
        },
        tier: {
            id: ((_d = request.tier) === null || _d === void 0 ? void 0 : _d.id) || request.tier_id,
            name: ((_e = request.tier) === null || _e === void 0 ? void 0 : _e.name) || '',
            baseHourlyRate: ((_f = request.tier) === null || _f === void 0 ? void 0 : _f.base_hourly_rate) || 0
        }
    };
}
/**
 * Convert ServiceCategory model to DTO
 */
function toServiceCategoryDto(category) {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.is_active
    };
}
/**
 * Convert ServiceTier model to DTO
 */
function toServiceTierDto(tier) {
    return {
        id: tier.id,
        categoryId: tier.category_id,
        name: tier.name,
        description: tier.description,
        baseHourlyRate: tier.base_hourly_rate,
        isActive: tier.is_active
    };
}
/**
 * Sanitize array of requests to DTOs
 */
function toServiceRequestDtoArray(requests) {
    return (0, base_sanitizer_1.sanitizeArray)(requests, toServiceRequestDto);
}
/**
 * Sanitize array of requests to detail DTOs
 */
function toServiceRequestDetailDtoArray(requests) {
    return (0, base_sanitizer_1.sanitizeArray)(requests, toServiceRequestDetailDto);
}
/**
 * Sanitize array of requests to list item DTOs
 */
function toServiceRequestListItemDtoArray(requests) {
    return (0, base_sanitizer_1.sanitizeArray)(requests, toServiceRequestListItemDto);
}
/**
 * Sanitize array of categories to DTOs
 */
function toServiceCategoryDtoArray(categories) {
    return (0, base_sanitizer_1.sanitizeArray)(categories, toServiceCategoryDto);
}
/**
 * Sanitize array of tiers to DTOs
 */
function toServiceTierDtoArray(tiers) {
    return (0, base_sanitizer_1.sanitizeArray)(tiers, toServiceTierDto);
}
