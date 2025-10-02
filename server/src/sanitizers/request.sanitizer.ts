/**
 * Request Sanitizer
 * Handles all service request-related data sanitization
 */

import ServiceRequest from '../models/ServiceRequest';
import ServiceCategory from '../models/ServiceCategory';
import ServiceTier from '../models/ServiceTier';
import {
  ServiceRequestDto,
  ServiceRequestDetailDto,
  ServiceRequestListItemDto,
  ServiceCategoryDto,
  ServiceTierDto
} from '../shared/dtos/request.dto';
import { sanitizeArray } from './base.sanitizer';
import { toPublicUserDto, toProviderWithContactDto } from './user.sanitizer';

/**
 * Convert ServiceRequest model to ServiceRequestDto
 */
export function toServiceRequestDto(request: ServiceRequest | any): ServiceRequestDto {
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
export function toServiceRequestDetailDto(request: ServiceRequest | any): ServiceRequestDetailDto {
  if (!request.user || !request.category || !request.tier) {
    throw new Error('Request must include user, category, and tier relations');
  }

  return {
    ...toServiceRequestDto(request),
    customer: toPublicUserDto(request.user),
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

