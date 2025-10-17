/**
 * Dashboard Service
 * 
 * Provides statistics and analytics for all user roles
 * Based on Technical Spec v1.1
 */

import ServiceRequest from '../models/ServiceRequest';
import User from '../models/User';
import Review from '../models/Review';
import { 
  CustomerStatsDto, 
  ProviderStatsDto, 
  AdminStatsDto, 
  ActivityItemDto 
} from '../../../shared-types';

export class DashboardService {
  /**
   * Get customer dashboard statistics
   */
  async getCustomerStats(userId: number): Promise<CustomerStatsDto> {
    // Get active requests
    const activeRequests = await ServiceRequest.query()
      .where('user_id', userId)
      .whereIn('status', ['pending', 'assigned', 'in_progress'])
      .resultSize();

    // Get completed jobs
    const completedJobs = await ServiceRequest.query()
      .where('user_id', userId)
      .where('status', 'completed')
      .resultSize();

    // Calculate total spent (estimate based on tier rates)
    const completedRequests = await ServiceRequest.query()
      .where('user_id', userId)
      .where('status', 'completed')
      .withGraphFetched('tier')
      .select();

    const totalSpent = completedRequests.reduce((sum, request) => {
      const estimatedCost = (request.tier?.base_hourly_rate || 0) * (request.estimated_hours || 1);
      return sum + estimatedCost;
    }, 0);

    // Get pending reviews
    const completedRequestIds = completedRequests.map(r => r.id);
    const existingReviewIds = await Review.query()
      .whereIn('request_id', completedRequestIds)
      .select('request_id');
    
    const reviewedIds = new Set(existingReviewIds.map(r => r.request_id));
    const pendingReviews = completedRequests.filter(r => !reviewedIds.has(r.id)).length;

    return {
      activeRequests,
      completedJobs,
      totalSpent: Math.round(totalSpent),
      pendingReviews
    };
  }

  /**
   * Get customer activity feed
   */
  async getCustomerActivity(userId: number, limit = 20): Promise<ActivityItemDto[]> {
    const requests = await ServiceRequest.query()
      .where('user_id', userId)
      .withGraphFetched('[category, assignedProvider]')
      .orderBy('updated_at', 'desc')
      .limit(limit);

    return requests.map(request => ({
      id: `request-${request.id}`,
      type: 'service_request',
      title: request.title,
      description: this.getRequestStatusDescription(request),
      timestamp: request.updated_at,
      metadata: {
        requestId: request.id,
        status: request.status,
        category: request.category?.name,
        providerName: request.assignedProvider?.fullName
      }
    }));
  }

  /**
   * Get provider dashboard statistics
   */
  async getProviderStats(providerId: number): Promise<ProviderStatsDto> {
    // Get provider details
    const provider = await User.query().findById(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Get active requests
    const activeRequests = await ServiceRequest.query()
      .where('assigned_provider_id', providerId)
      .whereIn('status', ['assigned', 'in_progress'])
      .resultSize();

    // Get completed jobs
    const completedJobs = provider.total_jobs_completed || 0;

    // Calculate total earnings (estimate)
    const completedRequests = await ServiceRequest.query()
      .where('assigned_provider_id', providerId)
      .where('status', 'completed')
      .withGraphFetched('tier')
      .select();

    const totalEarnings = completedRequests.reduce((sum, request) => {
      const earning = (request.tier?.base_hourly_rate || 0) * (request.estimated_hours || 1);
      return sum + earning;
    }, 0);

    // Calculate completion rate
    const totalJobs = completedJobs + (provider.total_jobs_declined || 0);
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 100;

    // Format response time
    const responseTime = provider.response_time_average 
      ? `${provider.response_time_average}m`
      : 'N/A';

    // Get pending assignment notifications
    const pendingAssignments = 0; // This would come from notifications table

    return {
      activeRequests,
      completedJobs,
      totalEarnings: Math.round(totalEarnings),
      averageRating: provider.average_rating || 0,
      responseTime,
      completionRate: Math.round(completionRate),
      pendingAssignments
    };
  }

  /**
   * Get provider activity/recent requests
   */
  async getProviderActivity(providerId: number, limit = 20): Promise<ActivityItemDto[]> {
    const requests = await ServiceRequest.query()
      .where('assigned_provider_id', providerId)
      .withGraphFetched('[category, user]')
      .orderBy('updated_at', 'desc')
      .limit(limit);

    return requests.map(request => ({
      id: `request-${request.id}`,
      type: 'assignment',
      title: request.title,
      description: this.getRequestStatusDescription(request),
      timestamp: request.updated_at,
      metadata: {
        requestId: request.id,
        status: request.status,
        category: request.category?.name,
        customerName: request.user?.fullName,
        urgency: request.urgency
      }
    }));
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStatsDto> {
    // Total users
    const totalUsers = await User.query().resultSize();

    // Active users (logged in within last 30 days - simplified)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.query()
      .where('created_at', '>=', thirtyDaysAgo.toISOString())
      .resultSize();

    // New users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.query()
      .where('created_at', '>=', sevenDaysAgo.toISOString())
      .resultSize();

    // Provider stats
    const totalProviders = await User.query()
      .where('is_service_provider', true)
      .resultSize();

    const pendingProviders = await User.query()
      .where('is_service_provider', true)
      .where('provider_status', 'pending')
      .resultSize();

    const approvedProviders = await User.query()
      .where('is_service_provider', true)
      .where('provider_status', 'approved')
      .resultSize();

    const rejectedProviders = await User.query()
      .where('is_service_provider', true)
      .where('provider_status', 'rejected')
      .resultSize();

    const suspendedProviders = await User.query()
      .where('is_service_provider', true)
      .where('provider_status', 'suspended')
      .resultSize();

    // Request stats
    const totalRequests = await ServiceRequest.query().resultSize();

    const pendingRequests = await ServiceRequest.query()
      .where('status', 'pending')
      .resultSize();

    const inProgressRequests = await ServiceRequest.query()
      .whereIn('status', ['assigned', 'in_progress'])
      .resultSize();

    const completedRequests = await ServiceRequest.query()
      .where('status', 'completed')
      .resultSize();

    const cancelledRequests = await ServiceRequest.query()
      .whereIn('status', ['cancelled', 'declined'])
      .resultSize();

    // Total revenue (estimate)
    const allCompletedRequests = await ServiceRequest.query()
      .where('status', 'completed')
      .withGraphFetched('tier')
      .select();

    const totalRevenue = allCompletedRequests.reduce((sum, request) => {
      const revenue = (request.tier?.base_hourly_rate || 0) * (request.estimated_hours || 1);
      return sum + revenue;
    }, 0);

    // Monthly revenue
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthCompletedRequests = await ServiceRequest.query()
      .where('status', 'completed')
      .where('created_at', '>=', firstDayThisMonth.toISOString())
      .withGraphFetched('tier')
      .select();

    const thisMonthRevenue = thisMonthCompletedRequests.reduce((sum, request) => {
      const revenue = (request.tier?.base_hourly_rate || 0) * (request.estimated_hours || 1);
      return sum + revenue;
    }, 0);

    const lastMonthCompletedRequests = await ServiceRequest.query()
      .where('status', 'completed')
      .where('created_at', '>=', firstDayLastMonth.toISOString())
      .where('created_at', '<', firstDayThisMonth.toISOString())
      .withGraphFetched('tier')
      .select();

    const lastMonthRevenue = lastMonthCompletedRequests.reduce((sum, request) => {
      const revenue = (request.tier?.base_hourly_rate || 0) * (request.estimated_hours || 1);
      return sum + revenue;
    }, 0);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers
      },
      providers: {
        total: totalProviders,
        pending: pendingProviders,
        approved: approvedProviders,
        rejected: rejectedProviders,
        suspended: suspendedProviders
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        cancelled: cancelledRequests
      },
      revenue: {
        total: Math.round(totalRevenue),
        thisMonth: Math.round(thisMonthRevenue),
        lastMonth: Math.round(lastMonthRevenue)
      }
    };
  }

  /**
   * Get admin activity feed
   */
  async getAdminActivity(limit = 50): Promise<ActivityItemDto[]> {
    // Get recent service requests
    const requests = await ServiceRequest.query()
      .withGraphFetched('[user, category, assignedProvider]')
      .orderBy('created_at', 'desc')
      .limit(limit);

    const activities: ActivityItemDto[] = requests.map(request => ({
      id: `request-${request.id}`,
      type: 'service_request',
      title: `${request.user?.fullName} requested ${request.category?.name}`,
      description: `Status: ${request.status}`,
      timestamp: request.created_at,
      metadata: {
        requestId: request.id,
        userId: request.user_id,
        status: request.status
      }
    }));

    return activities;
  }

  /**
   * Get request status description for activity feed
   */
  private getRequestStatusDescription(request: ServiceRequest): string {
    switch (request.status) {
      case 'pending':
        return 'Waiting for provider assignment';
      case 'assigned':
        return `Assigned to ${request.assignedProvider?.fullName || 'provider'}`;
      case 'in_progress':
        return 'Work in progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return request.status;
    }
  }
}

export const dashboardService = new DashboardService();


