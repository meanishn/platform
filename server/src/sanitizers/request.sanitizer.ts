/**
 * Request Sanitizer
 * Handles all service request-related data sanitization
 * Updated: 2025-10-17 - Using centralized DTOs from shared/dtos
 */

import ServiceRequest from '../models/ServiceRequest';
import ServiceCategory from '../models/ServiceCategory';
import ServiceTier from '../models/ServiceTier';
import {
  ServiceRequestDto,
  ServiceRequestDetailDto,
  ServiceRequestListItemDto,
  ServiceCategoryDto,
  ServiceTierDto,
  ProviderAssignmentDto
} from '../shared/dtos/request.dto';
import { sanitizeArray } from './base.sanitizer';
import { toPublicUserDto, toProviderWithContactDto } from './user.sanitizer';

/**
 * Convert ServiceRequest model to ServiceRequestDto
 */
export function toServiceRequestDto(request: ServiceRequest | any): ServiceRequestDto {
  // Parse images if stored as JSON string
  let images: string[] | undefined;
  if (request.images) {
    try {
      images = typeof request.images === 'string' 
        ? JSON.parse(request.images) 
        : request.images;
    } catch {
      images = [];
    }
  }

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
    images,
    
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
 * @param request - ServiceRequest with relations
 * @param isAssignedProvider - Whether the requester is the assigned provider (for progressive customer disclosure)
 */
export function toServiceRequestDetailDto(request: ServiceRequest | any, isAssignedProvider = false): ServiceRequestDetailDto {
  if (!request.user || !request.category || !request.tier) {
    throw new Error('Request must include user, category, and tier relations');
  }

  // Build customer object - include contact info only for assigned provider
  const customer: any = toPublicUserDto(request.user);
  
  // Add contact information only for assigned provider
  if (isAssignedProvider && request.status === 'assigned') {
    customer.email = request.user.email;
    customer.phone = request.user.phone;
  }

  return {
    ...toServiceRequestDto(request),
    customer,
    category: toServiceCategoryDto(request.category),
    tier: toServiceTierDto(request.tier),
    assignedProvider: request.assignedProvider 
      ? toProviderWithContactDto(request.assignedProvider)
      : undefined
  };
}

/**
 * Convert ServiceRequest to list item DTO (optimized for lists)
 */
export function toServiceRequestListItemDto(request: ServiceRequest | any): ServiceRequestListItemDto {
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
    completedAt: request.completed_at,
    
    category: {
      id: request.category?.id || request.category_id,
      name: request.category?.name || '',
      icon: request.category?.icon
    },
    tier: {
      id: request.tier?.id || request.tier_id,
      name: request.tier?.name || '',
      baseHourlyRate: request.tier?.base_hourly_rate || 0
    }
  };
}

/**
 * Convert ServiceCategory model to DTO
 */
export function toServiceCategoryDto(category: ServiceCategory | any): ServiceCategoryDto {
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
export function toServiceTierDto(tier: ServiceTier | any): ServiceTierDto {
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
export function toServiceRequestDtoArray(requests: ServiceRequest[]): ServiceRequestDto[] {
  return sanitizeArray(requests, toServiceRequestDto);
}

/**
 * Sanitize array of requests to detail DTOs
 */
export function toServiceRequestDetailDtoArray(requests: ServiceRequest[]): ServiceRequestDetailDto[] {
  return sanitizeArray(requests, toServiceRequestDetailDto);
}

/**
 * Sanitize array of requests to list item DTOs
 */
export function toServiceRequestListItemDtoArray(requests: ServiceRequest[]): ServiceRequestListItemDto[] {
  return sanitizeArray(requests, toServiceRequestListItemDto);
}

/**
 * Sanitize array of categories to DTOs
 */
export function toServiceCategoryDtoArray(categories: ServiceCategory[]): ServiceCategoryDto[] {
  return sanitizeArray(categories, toServiceCategoryDto);
}

/**
 * Sanitize array of tiers to DTOs
 */
export function toServiceTierDtoArray(tiers: ServiceTier[]): ServiceTierDto[] {
  return sanitizeArray(tiers, toServiceTierDto);
}

/**
 * Convert ServiceRequest to ProviderAssignmentDto
 * Used for provider's assignment/job views
 */
export function toProviderAssignmentDto(request: any, eligibleRecord?: any): ProviderAssignmentDto {
  // Create the detailed request object with customer contact info (provider is assigned)
  const requestDetail = toServiceRequestDetailDto(request, true); // true = isAssignedProvider, includes contact info
  
  // Map eligibility status to assignment status
  let assignmentStatus: 'pending' | 'accepted' | 'declined';
  if (eligibleRecord) {
    switch (eligibleRecord.status) {
      case 'selected':
      case 'accepted':
        assignmentStatus = 'accepted';
        break;
      case 'rejected':
      case 'cancelled_by_provider':
        assignmentStatus = 'declined';
        break;
      default:
        assignmentStatus = 'pending';
    }
  } else {
    assignmentStatus = 'pending';
  }
  
  return {
    id: eligibleRecord?.id || request.id, // Use eligible record id if available
    requestId: request.id,
    providerId: request.assigned_provider_id!,
    status: assignmentStatus,
    notifiedAt: eligibleRecord?.notified_at || request.assigned_at || request.created_at,
    respondedAt: eligibleRecord?.accepted_at || request.assigned_at,
    expiresAt: undefined, // Could be calculated if needed
    request: requestDetail
  };
}

