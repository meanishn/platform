/**
 * API Response Types
 */

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Dashboard Statistics Types
 */

// Customer Dashboard Stats
export interface CustomerStatsDto {
  activeRequests: number;
  completedJobs: number;
  totalSpent: number;
  pendingReviews: number;
}

// Provider Dashboard Stats
export interface ProviderStatsDto {
  activeRequests: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: string;
  completionRate: number;
  pendingAssignments: number;
}

// Admin Dashboard Stats
export interface AdminStatsDto {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  pendingVerifications: number;
  activeRequests: number;
  completedRequests: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface ActivityMetadata {
  requestId?: number;
  status?: string;
  category?: string;
  customerName?: string;
  urgency?: string;
  [key: string]: any;
}

// Activity Feed Item
export interface ActivityItemDto {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: ActivityMetadata
}

/**
 * Provider Action Types (Unified Endpoint)
 */

export type ProviderActionType = 'accept' | 'decline' | 'start' | 'complete' | 'cancel';

export interface ProviderActionRequest {
  action: ProviderActionType;
  reason?: string; // Required for decline/cancel
}

export interface ProviderActionResponse {
  success: boolean;
  message: string;
  data: {
    requestId: number;
    status: string;
    nextAction?: string;
    reopened?: boolean;
  };
}
