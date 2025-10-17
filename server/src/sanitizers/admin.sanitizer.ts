/**
 * Admin Sanitizer
 * Handles sanitization for admin-specific data
 * 
 * SECURITY NOTE: Even admin endpoints must NEVER expose:
 * - password or password_hash
 * - internal tokens
 * - encryption keys
 * - other sensitive system data
 */

import User from '../models/User';
import {
  AdminUserDto,
  AdminProviderDetailDto,
  AdminUserListDto,
  AdminAnalyticsDto
} from '../shared/dtos/admin.dto';
import { toPublicUserDto } from './user.sanitizer';
import { sanitizeArray } from './base.sanitizer';

/**
 * Convert User model to AdminUserDto
 * Includes more fields than PublicUserDto but NO sensitive data
 */
export function toAdminUserDto(user: User | any): AdminUserDto {
  return {
    ...toPublicUserDto(user),
    email: user.email,
    phone: user.phone,
    isServiceProvider: user.is_service_provider || false,
    isAdmin: user.is_admin || false,
    providerStatus: user.provider_status,
    isAvailable: user.is_available || false,
    createdAt: user.created_at,
    // ❌ NEVER include:
    // password_hash
    // password
    // internal_tokens
    // session_tokens
  };
}

/**
 * Convert User model with relations to AdminProviderDetailDto
 * For detailed provider view in admin panel
 */
export function toAdminProviderDetailDto(user: User | any): AdminProviderDetailDto {
  const baseDto = toAdminUserDto(user);
  
  // Parse qualified categories if present
  const qualifiedCategories = user.providerCategories?.map((pc: any) => ({
    categoryId: pc.category_id,
    categoryName: pc.category?.name || 'Unknown',
    qualifiedTiers: pc.qualified_tiers || [],
    isVerified: pc.is_verified || false,
    verifiedAt: pc.verified_at,
  })) || [];

  return {
    ...baseDto,
    providerBio: user.provider_bio,
    providerSkills: user.provider_skills,
    providerCertifications: user.provider_certifications,
    providerApprovedAt: user.provider_approved_at,
    approvedBy: user.approved_by,
    approverName: user.approver ? 
      `${user.approver.first_name} ${user.approver.last_name}` : 
      undefined,
    qualifiedCategories,
    reviewCount: user.receivedReviews?.length || 0,
    averageResponseTime: user.response_time_average,
  };
}

/**
 * Convert user list with total to AdminUserListDto
 */
export function toAdminUserListDto(
  users: User[],
  total: number
): AdminUserListDto {
  return {
    users: sanitizeArray(users, toAdminUserDto),
    total,
  };
}

/**
 * Sanitize analytics data
 * No user data here, but ensuring consistent structure
 */
export function toAdminAnalyticsDto(analytics: {
  requestsOverTime: Array<{ date: string; count: number }>;
  categoriesDistribution: Array<{ category: string; count: number }>;
  averageResponseTime: number;
  completionRate: number;
}): AdminAnalyticsDto {
  return {
    requestsOverTime: analytics.requestsOverTime,
    categoriesDistribution: analytics.categoriesDistribution,
    averageResponseTime: analytics.averageResponseTime,
    completionRate: analytics.completionRate,
  };
}

/**
 * Sanitize array of users to admin DTOs
 */
export function toAdminUserDtoArray(users: User[]): AdminUserDto[] {
  return sanitizeArray(users, toAdminUserDto);
}

/**
 * Sanitize array of providers to admin detail DTOs
 */
export function toAdminProviderDetailDtoArray(users: User[]): AdminProviderDetailDto[] {
  return sanitizeArray(users, toAdminProviderDetailDto);
}

