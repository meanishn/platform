/**
 * Real API Service
 * Replaces MSW mock with actual server API calls
 */

import { apiClient, handleResponse } from './apiClient';
import type {
  ApiResponse,
  AuthResponseDto,
  LoginCredentials,
  RegisterData,
  ServiceCategoryDto,
  ServiceTierDto,
  ServiceRequestDto,
  ServiceRequestDetailDto,
  ServiceRequestListItemDto,
  CreateServiceRequestDto,
  NotificationListDto,
  ProviderAssignmentDto,
  AcceptAssignmentDto,
  DeclineAssignmentDto,
  AuthUserDto,
  ReviewDto,
  ReviewDetailDto,
  ProviderRatingStatsDto,
  CreateReviewDto,
  UpdateProfileData,
  PublicUserDto,
  AuthUserRespose,
  CustomerStatsDto,
  ProviderStatsDto,
  AdminStatsDto,
  ActivityItemDto,
  ProviderActionRequest,
  ProviderActionResponse,
  ProviderJobDetailDto,
  JobDto,
  AdminUserDto,
  AdminUserListDto,
  AdminProviderDetailDto,
  AdminAnalyticsDto
} from '../types/api';

// Base API URL - in development, use the Vite proxy by using relative URLs
// In production, use the environment variable or default to the API server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Authentication API
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await apiClient(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true
    });
    return handleResponse<ApiResponse<AuthResponseDto>>(response);
  },

  register: async (data: RegisterData): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await apiClient(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    });
    return handleResponse<ApiResponse<AuthResponseDto>>(response);
  },

  verify: async (): Promise<ApiResponse<AuthUserRespose>> => {
    const response = await apiClient(`${API_BASE_URL}/auth/verify`);
    return handleResponse<ApiResponse<AuthUserRespose>>(response);
  }
};

/**
 * User Profile API
 */
export const userApi = {
  getProfile: async (): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/auth/verify`);
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  }
};

/**
 * Service Categories API
 */
export const serviceApi = {
  getCategories: async (): Promise<ApiResponse<ServiceCategoryDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/service-categories/categories`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<ServiceCategoryDto[]>>(response);
  },

  getCategoryTiers: async (categoryId: number): Promise<ApiResponse<ServiceTierDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/service-categories/categories/${categoryId}/tiers`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<ServiceTierDto[]>>(response);
  }
};

/**
 * Service Requests API
 */
export const requestApi = {
  createRequest: async (data: CreateServiceRequestDto): Promise<ApiResponse<ServiceRequestDto>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<ServiceRequestDto>>(response);
  },

  getUserRequests: async (): Promise<ApiResponse<ServiceRequestListItemDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests`);
    return handleResponse<ApiResponse<ServiceRequestListItemDto[]>>(response);
  },

  getRequest: async (id: number): Promise<ApiResponse<ServiceRequestDetailDto>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}`);
    return handleResponse<ApiResponse<ServiceRequestDetailDto>>(response);
  },

  cancelRequest: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}/cancel`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  startJob: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}/start`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  completeJob: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}/complete`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  getAssignedProvider: async (requestId: number): Promise<ApiResponse<{ provider: AuthUserDto }>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${requestId}/assigned-provider`);
    return handleResponse<ApiResponse<{ provider: AuthUserDto }>>(response);
  },

  confirmProvider: async (id: number, providerId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ providerId })
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  getAcceptedProviders: async (id: number): Promise<ApiResponse<PublicUserDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/service-requests/${id}/accepted-providers`);
    return handleResponse<ApiResponse<PublicUserDto[]>>(response);
  },

  // Provider-specific methods
  acceptAssignment: async (data: AcceptAssignmentDto): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments/accept`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  declineAssignment: async (data: DeclineAssignmentDto): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments/decline`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<void>>(response);
  }
};

/**
 * Notifications API
 */
export const notificationApi = {
  getUserNotifications: async (): Promise<ApiResponse<NotificationListDto>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications`);
    return handleResponse<ApiResponse<NotificationListDto>>(response);
  },

  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications/unread-count`);
    return handleResponse<ApiResponse<{ unreadCount: number }>>(response);
  },

  markAsRead: async (notificationId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  deleteNotification: async (notificationId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  deleteAllNotifications: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/notifications`, {
      method: 'DELETE'
    });
    return handleResponse<ApiResponse<void>>(response);
  }
};

/**
 * Provider Assignment API
 */
export const providerApi = {
  getAvailableJobs: async (): Promise<ApiResponse<JobDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/available-jobs`);
    return handleResponse<ApiResponse<JobDto[]>>(response);
  },

  getAssignments: async (): Promise<ApiResponse<ProviderAssignmentDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments`);
    return handleResponse<ApiResponse<ProviderAssignmentDto[]>>(response);
  },

  // Get provider-specific job details with match metadata and progressive customer disclosure
  // Optimized for provider views - includes matchScore, rank, distance, eligibility status
  getJobDetails: async (requestId: number): Promise<ApiResponse<ProviderJobDetailDto>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/requests/${requestId}`);
    return handleResponse<ApiResponse<ProviderJobDetailDto>>(response);
  },

  // NEW: Get accepted jobs waiting for customer selection
  getAcceptedPendingJobs: async (): Promise<ApiResponse<ServiceRequestListItemDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/accepted-jobs`);
    return handleResponse<ApiResponse<ServiceRequestListItemDto[]>>(response);
  },

  // NEW: Get cancelled jobs (for history/reference)
  getCancelledJobs: async (): Promise<ApiResponse<ServiceRequestListItemDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/cancelled`);
    return handleResponse<ApiResponse<ServiceRequestListItemDto[]>>(response);
  },

  // NEW: Unified action endpoint (accept, decline, start, complete, cancel)
  performAction: async (
    requestId: number,
    data: ProviderActionRequest
  ): Promise<ApiResponse<ProviderActionResponse>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/requests/${requestId}/action`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<ProviderActionResponse>>(response);
  },

  // LEGACY: Keep for backward compatibility (will be replaced with performAction)
  acceptAssignment: async (data: AcceptAssignmentDto): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments/accept`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  declineAssignment: async (data: DeclineAssignmentDto): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments/decline`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  getProviderStats: async (): Promise<ApiResponse<ProviderStatsDto>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/dashboard/stats`);
    return handleResponse<ApiResponse<ProviderStatsDto>>(response);
  },

  getProviderActivity: async (): Promise<ApiResponse<ActivityItemDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/dashboard/requests`);
    return handleResponse<ApiResponse<ActivityItemDto[]>>(response);
  }
};

/**
 * Admin API
 */
export const adminApi = {
  // ✅ Fixed: Server returns AdminUserListDto
  getUsers: async (filters?: { role?: string; status?: string }): Promise<ApiResponse<AdminUserListDto>> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    
    const url = params.toString() ? `${API_BASE_URL}/admin/users?${params}` : `${API_BASE_URL}/admin/users`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<AdminUserListDto>>(response);
  },

  // ✅ Fixed: Server returns AdminUserDto
  updateUser: async (userId: number, data: UpdateProfileData): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<AdminUserDto>>(response);
  },

  // ✅ Correct: No data returned
  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  // ✅ Fixed: Server returns AdminProviderDetailDto[]
  getPendingProviders: async (): Promise<ApiResponse<AdminProviderDetailDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/pending`);
    return handleResponse<ApiResponse<AdminProviderDetailDto[]>>(response);
  },

  // ✅ Fixed: Server returns AdminProviderDetailDto
  getProviderDetails: async (providerId: number): Promise<ApiResponse<AdminProviderDetailDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}`);
    return handleResponse<ApiResponse<AdminProviderDetailDto>>(response);
  },

  // ✅ Fixed: Server returns AdminUserDto
  approveProvider: async (providerId: number, qualifiedCategories: number[]): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ qualifiedCategories })
    });
    return handleResponse<ApiResponse<AdminUserDto>>(response);
  },

  // ✅ Fixed: Server returns AdminUserDto
  rejectProvider: async (providerId: number, reason: string): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return handleResponse<ApiResponse<AdminUserDto>>(response);
  },

  // ✅ Fixed: Server returns AdminUserDto
  suspendProvider: async (providerId: number, reason: string): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return handleResponse<ApiResponse<AdminUserDto>>(response);
  },

  // ✅ Fixed: Server returns AdminUserDto
  reactivateProvider: async (providerId: number): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/reactivate`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<AdminUserDto>>(response);
  },

  // ✅ Fixed: Server returns AdminAnalyticsDto
  getAnalytics: async (days?: number): Promise<ApiResponse<AdminAnalyticsDto>> => {
    const url = days ? `${API_BASE_URL}/admin/analytics?days=${days}` : `${API_BASE_URL}/admin/analytics`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<AdminAnalyticsDto>>(response);
  },

  // ✅ Correct: Already aligned with server
  getAdminStats: async (): Promise<ApiResponse<AdminStatsDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/dashboard/stats`);
    return handleResponse<ApiResponse<AdminStatsDto>>(response);
  },

  // ✅ Correct: Already aligned with server
  getAdminActivity: async (limit?: number): Promise<ApiResponse<ActivityItemDto[]>> => {
    const url = limit ? `${API_BASE_URL}/admin/dashboard/activity?limit=${limit}` : `${API_BASE_URL}/admin/dashboard/activity`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<ActivityItemDto[]>>(response);
  }
};

/**
 * Customer API
 */
export const customerApi = {
  getStats: async (): Promise<ApiResponse<CustomerStatsDto>> => {
    const response = await apiClient(`${API_BASE_URL}/customers/dashboard/stats`);
    return handleResponse<ApiResponse<CustomerStatsDto>>(response);
  },

  getActivity: async (limit?: number): Promise<ApiResponse<ActivityItemDto[]>> => {
    const url = limit ? `${API_BASE_URL}/customers/dashboard/activity?limit=${limit}` : `${API_BASE_URL}/customers/dashboard/activity`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<ActivityItemDto[]>>(response);
  }
};
