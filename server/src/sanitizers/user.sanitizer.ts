/**
 * User Sanitizer
 * Handles all user-related data sanitization
 */

import User from '../models/User';
import {
  AuthUserDto,
  PublicUserDto,
  ProviderProfileDto,
  ProviderWithContactDto
} from '../shared/dtos/user.dto';
import { sanitizeArray } from './base.sanitizer';

/**
 * Convert User model to AuthUserDto (authenticated user's own profile)
 * Includes personal info but NEVER includes password
 */
export function toAuthUserDto(user: User | any): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    address: user.address,
    latitude: user.latitude,
    longitude: user.longitude,
    profileImage: user.profile_image,
    
    role: user.role,
    isServiceProvider: user.is_service_provider,
    isAdmin: user.is_admin,
    
    providerStatus: user.provider_status,
    providerBio: user.provider_bio,
    providerSkills: user.provider_skills,
    providerCertifications: user.provider_certifications,
    averageRating: user.average_rating,
    totalJobsCompleted: user.total_jobs_completed,
    totalJobsDeclined: user.total_jobs_declined,
    responseTimeAverage: user.response_time_average,
    isAvailable: user.is_available,
    
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

/**
 * Convert User model to PublicUserDto (public profile)
 * Safe to show to anyone - NO contact info, NO sensitive data
 */
export function toPublicUserDto(user: User | any): PublicUserDto {
  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    profileImage: user.profile_image,
    averageRating: user.average_rating,
    totalJobsCompleted: user.total_jobs_completed,
    role: user.role
  };
}

/**
 * Convert User model to ProviderProfileDto (provider listing)
 * Includes provider-specific info but NO contact details
 */
export function toProviderProfileDto(user: User | any): ProviderProfileDto {
  return {
    ...toPublicUserDto(user),
    providerBio: user.provider_bio,
    providerSkills: user.provider_skills,
    responseTimeAverage: user.response_time_average,
    isAvailable: user.is_available
  };
}

/**
 * Convert User model to ProviderWithContactDto
 * ONLY use for confirmed assignments - includes contact information
 */
export function toProviderWithContactDto(user: User | any): ProviderWithContactDto {
  return {
    ...toProviderProfileDto(user),
    email: user.email,
    phone: user.phone
  };
}

/**
 * Sanitize array of users to public DTOs
 */
export function toPublicUserDtoArray(users: User[]): PublicUserDto[] {
  return sanitizeArray(users, toPublicUserDto);
}

/**
 * Sanitize array of users to provider profile DTOs
 */
export function toProviderProfileDtoArray(users: User[]): ProviderProfileDto[] {
  return sanitizeArray(users, toProviderProfileDto);
}

/**
 * Sanitize array of users to provider with contact DTOs
 */
export function toProviderWithContactDtoArray(users: User[]): ProviderWithContactDto[] {
  return sanitizeArray(users, toProviderWithContactDto);
}

