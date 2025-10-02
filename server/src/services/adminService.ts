/**
 * Admin Service
 * 
 * Handles administrative functions for platform management
 * Based on Technical Spec v1.1
 */

import User, { ProviderStatus } from '../models/User';
import ServiceRequest from '../models/ServiceRequest';
import ProviderCategory from '../models/ProviderCategory';
import ServiceCategory from '../models/ServiceCategory';
import { notificationService } from './notificationService';

export interface UserListFilters {
  role?: 'customer' | 'provider' | 'admin';
  status?: ProviderStatus;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ApproveProviderData {
  providerId: number;
  adminId: number;
  qualifiedCategories?: Array<{
    categoryId: number;
    tiers: ('basic' | 'expert' | 'premium')[];
  }>;
}

export class AdminService {
  /**
   * Get list of all users with filtering
   */
  async getUsers(filters: UserListFilters = {}): Promise<{
    users: User[];
    total: number;
  }> {
    let query = User.query()
      .select([
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'is_service_provider',
        'is_admin',
        'provider_status',
        'average_rating',
        'total_jobs_completed',
        'is_available',
        'created_at'
      ]);

    // Apply filters
    if (filters.role) {
      if (filters.role === 'admin') {
        query = query.where('is_admin', true);
      } else if (filters.role === 'provider') {
        query = query.where('is_service_provider', true);
      } else {
        query = query.where('is_service_provider', false).where('is_admin', false);
      }
    }

    if (filters.status) {
      query = query.where('provider_status', filters.status);
    }

    if (filters.searchQuery) {
      const search = `%${filters.searchQuery}%`;
      query = query.where(builder => {
        builder
          .where('email', 'ilike', search)
          .orWhere('first_name', 'ilike', search)
          .orWhere('last_name', 'ilike', search);
      });
    }

    // Get total count
    const totalQuery = query.clone();
    const totalResult = await totalQuery.count('* as count').first();
    const total = parseInt((totalResult as any)?.count || '0');

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const users = await query
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return { users, total };
  }

  /**
   * Get provider details with qualifications
   */
  async getProviderDetails(providerId: number): Promise<User | undefined> {
    return User.query()
      .findById(providerId)
      .withGraphFetched('[providerCategories.category, receivedReviews, approver]');
  }

  /**
   * Get pending provider applications
   */
  async getPendingProviders(): Promise<User[]> {
    return User.query()
      .where('is_service_provider', true)
      .where('provider_status', 'pending')
      .withGraphFetched('providerCategories.category')
      .orderBy('created_at', 'asc');
  }

  /**
   * Approve a provider application
   */
  async approveProvider(data: ApproveProviderData): Promise<User> {
    const provider = await User.query().findById(data.providerId);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!provider.is_service_provider) {
      throw new Error('User is not a service provider');
    }

    if (provider.provider_status === 'approved') {
      throw new Error('Provider is already approved');
    }

    // Update provider status
    const updatedProvider = await User.query()
      .patchAndFetchById(data.providerId, {
        provider_status: 'approved',
        provider_approved_at: new Date().toISOString(),
        approved_by: data.adminId,
        is_available: true
      });

    // Set qualified categories and tiers if provided
    if (data.qualifiedCategories && data.qualifiedCategories.length > 0) {
      // Delete existing qualifications
      await ProviderCategory.query()
        .delete()
        .where('provider_id', data.providerId);

      // Insert new qualifications
      for (const qual of data.qualifiedCategories) {
        await ProviderCategory.query().insert({
          provider_id: data.providerId,
          category_id: qual.categoryId,
          qualified_tiers: qual.tiers,
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: data.adminId
        });
      }
    }

    // Notify provider
    await notificationService.createNotification({
      userId: data.providerId,
      type: 'provider_approved',
      title: 'Application Approved!',
      message: 'Your provider application has been approved. You can now receive service requests!',
      data: { providerId: data.providerId }
    });

    console.log(`✅ Provider ${data.providerId} approved by admin ${data.adminId}`);

    return updatedProvider;
  }

  /**
   * Reject a provider application
   */
  async rejectProvider(
    providerId: number,
    adminId: number,
    reason?: string
  ): Promise<User> {
    const provider = await User.query().findById(providerId);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!provider.is_service_provider) {
      throw new Error('User is not a service provider');
    }

    const updatedProvider = await User.query()
      .patchAndFetchById(providerId, {
        provider_status: 'rejected',
        approved_by: adminId
      });

    // Notify provider
    await notificationService.createNotification({
      userId: providerId,
      type: 'provider_rejected',
      title: 'Application Not Approved',
      message: reason || 'Your provider application was not approved at this time.',
      data: { providerId, reason }
    });

    console.log(`❌ Provider ${providerId} rejected by admin ${adminId}`);

    return updatedProvider;
  }

  /**
   * Suspend a provider
   */
  async suspendProvider(
    providerId: number,
    adminId: number,
    reason?: string
  ): Promise<User> {
    const provider = await User.query().findById(providerId);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!provider.is_service_provider) {
      throw new Error('User is not a service provider');
    }

    const updatedProvider = await User.query()
      .patchAndFetchById(providerId, {
        provider_status: 'suspended',
        is_available: false
      });

    // Notify provider
    await notificationService.createNotification({
      userId: providerId,
      type: 'provider_suspended',
      title: 'Account Suspended',
      message: reason || 'Your provider account has been suspended.',
      data: { providerId, reason }
    });

    // Cancel any active assignments
    await ServiceRequest.query()
      .patch({ status: 'cancelled' })
      .where('assigned_provider_id', providerId)
      .whereIn('status', ['assigned', 'in_progress']);

    console.log(`⚠️ Provider ${providerId} suspended by admin ${adminId}`);

    return updatedProvider;
  }

  /**
   * Reactivate a suspended provider
   */
  async reactivateProvider(providerId: number, adminId: number): Promise<User> {
    const provider = await User.query().findById(providerId);
    
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.provider_status !== 'suspended') {
      throw new Error('Provider is not suspended');
    }

    const updatedProvider = await User.query()
      .patchAndFetchById(providerId, {
        provider_status: 'approved',
        is_available: true
      });

    // Notify provider
    await notificationService.createNotification({
      userId: providerId,
      type: 'provider_reactivated',
      title: 'Account Reactivated',
      message: 'Your provider account has been reactivated.',
      data: { providerId }
    });

    console.log(`✅ Provider ${providerId} reactivated by admin ${adminId}`);

    return updatedProvider;
  }

  /**
   * Update user profile (admin override)
   */
  async updateUserProfile(
    userId: number,
    updates: Partial<User>
  ): Promise<User> {
    const user = await User.query().findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields that shouldn't be updated this way
    const { password, ...safeUpdates } = updates as any;

    return User.query().patchAndFetchById(userId, safeUpdates);
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: number, adminId: number): Promise<void> {
    const user = await User.query().findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting admins (safety check)
    if (user.is_admin) {
      throw new Error('Cannot delete admin users');
    }

    // Cancel all active requests
    await ServiceRequest.query()
      .patch({ status: 'cancelled' })
      .where(builder => {
        builder
          .where('user_id', userId)
          .orWhere('assigned_provider_id', userId);
      })
      .whereIn('status', ['pending', 'assigned', 'in_progress']);

    // Delete user
    await User.query().deleteById(userId);

    console.log(`🗑️ User ${userId} deleted by admin ${adminId}`);
  }

  /**
   * Get platform analytics
   */
  async getAnalytics(days = 30): Promise<{
    requestsOverTime: Array<{ date: string; count: number }>;
    categoriesDistribution: Array<{ category: string; count: number }>;
    averageResponseTime: number;
    completionRate: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Requests over time
    const requestsOverTime = await ServiceRequest.query()
      .where('created_at', '>=', startDate.toISOString())
      .select('created_at')
      .then(requests => {
        const counts: { [key: string]: number } = {};
        requests.forEach(request => {
          const date = request.created_at.split('T')[0];
          counts[date] = (counts[date] || 0) + 1;
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count }));
      });

    // Categories distribution
    const categoriesDistribution = await ServiceRequest.query()
      .where('created_at', '>=', startDate.toISOString())
      .withGraphFetched('category')
      .then(requests => {
        const counts: { [key: string]: number } = {};
        requests.forEach(request => {
          const category = request.category?.name || 'Unknown';
          counts[category] = (counts[category] || 0) + 1;
        });
        return Object.entries(counts).map(([category, count]) => ({ category, count }));
      });

    // Average response time (simplified - time from creation to assignment)
    const assignedRequests = await ServiceRequest.query()
      .whereNotNull('assigned_at')
      .where('created_at', '>=', startDate.toISOString())
      .select('created_at', 'assigned_at');

    const averageResponseTime = assignedRequests.length > 0
      ? assignedRequests.reduce((sum, request) => {
          const created = new Date(request.created_at).getTime();
          const assigned = new Date(request.assigned_at!).getTime();
          return sum + (assigned - created) / 1000 / 60; // minutes
        }, 0) / assignedRequests.length
      : 0;

    // Completion rate
    const totalRequests = await ServiceRequest.query()
      .where('created_at', '>=', startDate.toISOString())
      .resultSize();

    const completedRequests = await ServiceRequest.query()
      .where('created_at', '>=', startDate.toISOString())
      .where('status', 'completed')
      .resultSize();

    const completionRate = totalRequests > 0
      ? (completedRequests / totalRequests) * 100
      : 0;

    return {
      requestsOverTime,
      categoriesDistribution,
      averageResponseTime: Math.round(averageResponseTime),
      completionRate: Math.round(completionRate)
    };
  }
}

export const adminService = new AdminService();


