/**
 * Admin Types
 * DTOs for administrative functions
 */

import { PublicUserDto, UserRole, ProviderStatus } from './user';

/**
 * Admin view of user (more fields than public, but still no passwords!)
 */
export interface AdminUserDto extends PublicUserDto {
  email: string;
  phone?: string;
  isServiceProvider: boolean;
  isAdmin: boolean;
  providerStatus?: ProviderStatus;
  isAvailable: boolean;
  createdAt: string;
}

/**
 * Admin view of provider with detailed information
 */
export interface AdminProviderDetailDto extends AdminUserDto {
  providerBio?: string;
  providerSkills?: string[];
  providerCertifications?: any[];
  providerApprovedAt?: string;
  approvedBy?: number;
  approverName?: string;
  qualifiedCategories?: Array<{
    categoryId: number;
    categoryName: string;
    qualifiedTiers: string[];
    isVerified: boolean;
    verifiedAt?: string;
  }>;
  reviewCount?: number;
  averageResponseTime?: number;
}

/**
 * User list response with pagination
 */
export interface AdminUserListDto {
  users: AdminUserDto[];
  total: number;
}

/**
 * Platform analytics data
 */
export interface AdminAnalyticsDto {
  requestsOverTime: Array<{
    date: string;
    count: number;
  }>;
  categoriesDistribution: Array<{
    category: string;
    count: number;
  }>;
  averageResponseTime: number;
  completionRate: number;
}

/**
 * Admin statistics for dashboard
 */
export interface AdminStatsDto {
  users: {
    total: number;
    active: number;
    new: number;
  };
  providers: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  requests: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

/**
 * Admin activity item
 */
export interface AdminActivityItemDto {
  id: number;
  type: 'user_registered' | 'provider_approved' | 'provider_rejected' | 'provider_suspended' | 'request_created' | 'request_completed';
  message: string;
  userId?: number;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

