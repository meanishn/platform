/**
 * User Data Transfer Objects
 * These DTOs define the shape of user data sent to clients
 * NEVER include sensitive fields like passwords or tokens
 */

export type UserRole = 'customer' | 'provider' | 'admin';
export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Public user info (safe to show to anyone)
export interface PublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  averageRating?: number;
  totalJobsCompleted: number;
  role: UserRole;
}

// Provider public profile (for listings and search)
export interface ProviderProfileDto extends PublicUserDto {
  providerBio?: string;
  providerSkills?: string[];
  responseTimeAverage?: number;
  isAvailable: boolean;
}

// Provider profile with contact (only for confirmed assignments)
export interface ProviderWithContactDto extends ProviderProfileDto {
  email: string;
  phone?: string;
}

// Authenticated user's own profile (includes personal info but NOT password)
export interface AuthUserDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  
  // Role info
  role: UserRole;
  isServiceProvider: boolean;
  isAdmin: boolean;
  
  // Provider-specific
  providerStatus?: ProviderStatus;
  providerBio?: string;
  providerSkills?: string[];
  providerCertifications?: any[];
  averageRating?: number;
  totalJobsCompleted: number;
  totalJobsDeclined: number;
  responseTimeAverage?: number;
  isAvailable: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// Auth response (includes token)
export interface AuthResponseDto {
  user: AuthUserDto;
  token: string;
}

