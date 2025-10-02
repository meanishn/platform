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
  NotificationDto,
  ReviewDto,
  ReviewDetailDto,
  ProviderRatingStatsDto,
  CreateReviewDto,
  UpdateProfileData,
  PublicUserDto,
  AuthUserRespose
} from '../types/api';

// Base API URL - in development, use the Vite proxy by using relative URLs
// In production, use the environment variable or default to the API server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Activity item interface for dashboard APIs
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

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
 * Dashboard API
 */
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<{
    totalUsers: number;
    totalProviders: number;
    totalCustomers: number;
    pendingVerifications: number;
    activeRequests: number;
    totalRevenue: number;
    monthlyGrowth: number;
  }>> => {
    const response = await apiClient(`${API_BASE_URL}/dashboard/stats`);
    return handleResponse<ApiResponse<{
      totalUsers: number;
      totalProviders: number;
      totalCustomers: number;
      pendingVerifications: number;
      activeRequests: number;
      totalRevenue: number;
      monthlyGrowth: number;
    }>>(response);
  },
  getActivity: async(): Promise<ApiResponse<ActivityItem[]>> => {
    const response = await apiClient(`${API_BASE_URL}/dashboard/activity`);
    return handleResponse<ApiResponse<ActivityItem[]>>(response);
  }
};

/**
 * Health check
 */
export const healthApi = {
  check: async (): Promise<ApiResponse<{ message: string; timestamp: string }>> => {
    const response = await apiClient(`${API_BASE_URL}/health`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<{ message: string; timestamp: string }>>(response);
  }
};

/**
 * Provider Assignment API
 */
export const providerApi = {
  getAssignments: async (): Promise<ApiResponse<ProviderAssignmentDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/assignments`);
    return handleResponse<ApiResponse<ProviderAssignmentDto[]>>(response);
  },

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

  getProviderStats: async (): Promise<ApiResponse<{ 
    activeRequests: number;
    completedJobs: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: string;
    completionRate: number;
    pendingAssignments: number;
  }>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/dashboard/stats`);
    return handleResponse<ApiResponse<{ 
      activeRequests: number;
      completedJobs: number;
      totalEarnings: number;
      averageRating: number;
      responseTime: string;
      completionRate: number;
      pendingAssignments: number;
    }>>(response);
  },

  getProviderActivity: async (): Promise<ApiResponse<ServiceRequestListItemDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/providers/dashboard/requests`);
    return handleResponse<ApiResponse<ServiceRequestListItemDto[]>>(response);
  }
};

/**
 * Review API
 */
export const reviewApi = {
  createReview: async (requestId: number, data: CreateReviewDto): Promise<ApiResponse<ReviewDto>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/${requestId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<ReviewDto>>(response);
  },

  getProviderReviews: async (providerId: number): Promise<ApiResponse<ReviewDetailDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/provider/${providerId}`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<ReviewDetailDto[]>>(response);
  },

  getProviderStats: async (providerId: number): Promise<ApiResponse<ProviderRatingStatsDto>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/provider/${providerId}/stats`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<ProviderRatingStatsDto>>(response);
  },

  getRequestReview: async (requestId: number): Promise<ApiResponse<ReviewDetailDto>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/request/${requestId}`, {
      skipAuth: true
    });
    return handleResponse<ApiResponse<ReviewDetailDto>>(response);
  },

  canReview: async (requestId: number): Promise<ApiResponse<{ canReview: boolean; reason?: string }>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/request/${requestId}/can-review`);
    return handleResponse<ApiResponse<{ canReview: boolean; reason?: string }>>(response);
  },

  getUserReviews: async (): Promise<ApiResponse<ReviewDetailDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/reviews/my-reviews`);
    return handleResponse<ApiResponse<ReviewDetailDto[]>>(response);
  }
};

/**
 * Admin API
 */
export const adminApi = {
  getUsers: async (filters?: { role?: string; status?: string }): Promise<ApiResponse<PublicUserDto[]>> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    
    const url = params.toString() ? `${API_BASE_URL}/admin/users?${params}` : `${API_BASE_URL}/admin/users`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<PublicUserDto[]>>(response);
  },

  updateUser: async (userId: number, data: UpdateProfileData): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    return handleResponse<ApiResponse<void>>(response);
  },

  getPendingProviders: async (): Promise<ApiResponse<AuthUserDto[]>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/pending`);
    return handleResponse<ApiResponse<AuthUserDto[]>>(response);
  },

  getProviderDetails: async (providerId: number): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}`);
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  approveProvider: async (providerId: number, qualifiedCategories: number[]): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ qualifiedCategories })
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  rejectProvider: async (providerId: number, reason: string): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  suspendProvider: async (providerId: number, reason: string): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  reactivateProvider: async (providerId: number): Promise<ApiResponse<AuthUserDto>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/providers/${providerId}/reactivate`, {
      method: 'PATCH'
    });
    return handleResponse<ApiResponse<AuthUserDto>>(response);
  },

  getAnalytics: async (days?: number): Promise<ApiResponse<{
    totalRevenue: number;
    totalRequests: number;
    completedRequests: number;
    activeProviders: number;
    customerSatisfaction: number;
    monthlyGrowth: number;
  }>> => {
    const url = days ? `${API_BASE_URL}/admin/analytics?days=${days}` : `${API_BASE_URL}/admin/analytics`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<{
      totalRevenue: number;
      totalRequests: number;
      completedRequests: number;
      activeProviders: number;
      customerSatisfaction: number;
      monthlyGrowth: number;
    }>>(response);
  },

  getAdminStats: async (): Promise<ApiResponse<{
    totalUsers: number;
    totalProviders: number;
    totalCustomers: number;
    pendingVerifications: number;
    activeRequests: number;
    completedRequests: number;
    totalRevenue: number;
    monthlyGrowth: number;
  }>> => {
    const response = await apiClient(`${API_BASE_URL}/admin/dashboard/stats`);
    return handleResponse<ApiResponse<{
      totalUsers: number;
      totalProviders: number;
      totalCustomers: number;
      pendingVerifications: number;
      activeRequests: number;
      completedRequests: number;
      totalRevenue: number;
      monthlyGrowth: number;
    }>>(response);
  },

  getAdminActivity: async (limit?: number): Promise<ApiResponse<ActivityItem[]>> => {
    const url = limit ? `${API_BASE_URL}/admin/dashboard/activity?limit=${limit}` : `${API_BASE_URL}/admin/dashboard/activity`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<ActivityItem[]>>(response);
  }
};

/**
 * Customer API
 */
export const customerApi = {
  getStats: async (): Promise<ApiResponse<{
    activeRequests: number;
    completedJobs: number;
    totalSpent: number;
    pendingReviews: number;
  }>> => {
    const response = await apiClient(`${API_BASE_URL}/customers/dashboard/stats`);
    return handleResponse<ApiResponse<{
      activeRequests: number;
      completedJobs: number;
      totalSpent: number;
      pendingReviews: number;
    }>>(response);
  },

  getActivity: async (limit?: number): Promise<ApiResponse<ActivityItem[]>> => {
    const url = limit ? `${API_BASE_URL}/customers/dashboard/activity?limit=${limit}` : `${API_BASE_URL}/customers/dashboard/activity`;
    const response = await apiClient(url);
    return handleResponse<ApiResponse<ActivityItem[]>>(response);
  }
};
