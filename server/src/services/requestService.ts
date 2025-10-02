/**
 * Request Service - Assignment-Based Model
 * 
 * Handles service request lifecycle according to Technical Spec v1.1
 * NO proposals - automatic provider matching and assignment
 */

import ServiceRequest, { RequestStatus, UrgencyLevel } from '../models/ServiceRequest';
import User from '../models/User';
import RequestAcceptance from '../models/RequestAcceptance';
import { matchingService } from './matchingService';
import { notificationService } from './notificationService';

export interface CreateRequestData {
  userId: number;
  categoryId: number;
  tierId: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  preferredDate?: string;
  urgency?: UrgencyLevel;
  estimatedHours?: number;
  images?: string[];
}

export class RequestService {
  /**
   * Create a new service request with automatic provider matching
   * This triggers the automatic matching algorithm
   */
  async createRequest(data: CreateRequestData): Promise<ServiceRequest> {

    console.log('images at insert:', data.images);
    console.log('JSON.stringify(images):', JSON.stringify(data.images));

    // Create the request
    const request = await ServiceRequest.query().insertAndFetch({
      user_id: data.userId,
      category_id: data.categoryId,
      tier_id: data.tierId,
      title: data.title,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      preferred_date: data.preferredDate,
      urgency: data.urgency || 'medium',
      estimated_hours: data.estimatedHours,
      images: JSON.stringify(data.images) as any,
      status: 'pending'
    });

    console.log(`✅ Created service request ${request.id}`);

    // Automatically match and notify qualified providers (async, non-blocking)
    matchingService.matchProvidersToRequest(request).catch(error => {
      console.error(`Error matching providers for request ${request.id}:`, error);
    });

    return request;
  }

  /**
   * Provider accepts an assignment
   * First provider to accept gets the job
   */
  async acceptAssignment(requestId: number, providerId: number): Promise<ServiceRequest> {
    const request = await ServiceRequest.query()
      .findById(requestId)
      .withGraphFetched('[user, category, tier]');

    if (!request) {
      throw new Error('Request not found');
    }

    // Allow multiple acceptances while request is pending
    if (request.status !== 'pending') {
      throw new Error('Request is not accepting providers');
    }

    // Verify provider is qualified (additional check)
    const provider = await User.query()
      .findById(providerId)
      .withGraphFetched('providerCategories');

    if (!provider || !provider.isApprovedProvider) {
      throw new Error('Provider not authorized');
    }

    // Record provider acceptance (idempotent)
    await RequestAcceptance.query().insert({
      request_id: requestId,
      provider_id: providerId
    }).onConflict(['request_id', 'provider_id']).ignore();

    // Keep request in 'pending' until customer confirms a provider

    // Notify customer of a new acceptance
    await notificationService.createNotification({
      userId: request.user_id,
      type: 'provider_accepted',
      title: 'A provider accepted your request',
      message: `${provider.fullName} is available for "${request.title}". Please confirm to proceed.`,
      data: {
        requestId,
        providerId,
        providerName: provider.fullName,
        providerRating: provider.average_rating
      }
    });

    console.log(`✅ Provider ${providerId} accepted request ${requestId}`);

    return request;
  }

  /**
   * Customer confirms a provider among acceptances
   */
  async confirmProvider(requestId: number, customerId: number, providerId: number): Promise<ServiceRequest> {
    const request = await ServiceRequest.query().findById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }
    if (request.user_id !== customerId) {
      throw new Error('Unauthorized to confirm provider for this request');
    }
    if (request.status !== 'pending') {
      throw new Error('Request is not awaiting confirmation');
    }

    // Ensure the provider has accepted
    const acceptance = await RequestAcceptance.query()
      .where({ request_id: requestId, provider_id: providerId })
      .first();
    if (!acceptance) {
      throw new Error('Selected provider has not accepted this request');
    }

    const updated = await ServiceRequest.query().patchAndFetchById(requestId, {
      status: 'assigned',
      assigned_provider_id: providerId,
      assigned_at: new Date().toISOString(),
      provider_accepted_at: new Date().toISOString()
    });

    // Remove other acceptances
    await RequestAcceptance.query()
      .delete()
      .where('request_id', requestId)
      .where('provider_id', '!=', providerId);

    // Notify selected provider
    await notificationService.createNotification({
      userId: providerId,
      type: 'assignment_confirmed',
      title: 'Assignment confirmed',
      message: `Customer confirmed you for "${request.title}".`,
      data: { requestId }
    });

    // Notify customer confirmation success
    await notificationService.createNotification({
      userId: request.user_id,
      type: 'assignment_confirmed_customer',
      title: 'Provider confirmed',
      message: `You confirmed ${providerId} for "${request.title}".`,
      data: { requestId, providerId }
    });

    return updated;
  }

  /**
   * Provider declines an assignment
   */
  async declineAssignment(
    requestId: number,
    providerId: number,
    reason?: string
  ): Promise<void> {
    const request = await ServiceRequest.query().findById(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      console.warn(`Provider ${providerId} tried to decline request ${requestId} with status ${request.status}`);
      return; // Already assigned to someone else
    }

    // Update provider stats
    const provider = await User.query().findById(providerId);
    if (provider) {
      await User.query()
        .patchAndFetchById(providerId, {
          total_jobs_declined: (provider.total_jobs_declined || 0) + 1
        });
    }

    console.log(`❌ Provider ${providerId} declined request ${requestId}`);

    // Check if we need to rematch (if all notified providers declined)
    // This would be handled by a separate cron job or notification expiry system
  }

  /**
   * Start work on assigned job
   */
  async startJob(requestId: number, providerId: number): Promise<ServiceRequest> {
    const request = await ServiceRequest.query().findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.assigned_provider_id !== providerId) {
      throw new Error('Only the assigned provider can start this job');
    }

    if (request.status !== 'assigned') {
      throw new Error('Job cannot be started from current status');
    }

    const updatedRequest = await ServiceRequest.query()
      .patchAndFetchById(requestId, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });

    // Notify customer
    await notificationService.createNotification({
      userId: request.user_id,
      type: 'job_started',
      title: 'Work Started',
      message: `Work has started on "${request.title}"`,
      data: { requestId }
    });

    return updatedRequest;
  }

  /**
   * Complete a job
   */
  async completeJob(requestId: number, providerId: number): Promise<ServiceRequest> {
    const request = await ServiceRequest.query().findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.assigned_provider_id !== providerId) {
      throw new Error('Only the assigned provider can complete this job');
    }

    if (request.status !== 'in_progress') {
      throw new Error('Job is not in progress');
    }

    const updatedRequest = await ServiceRequest.query()
      .patchAndFetchById(requestId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    // Update provider stats
    const provider = await User.query().findById(providerId);
    if (provider) {
      await User.query()
        .patchAndFetchById(providerId, {
          total_jobs_completed: (provider.total_jobs_completed || 0) + 1
        });
    }

    // Notify customer
    await notificationService.createNotification({
      userId: request.user_id,
      type: 'job_completed',
      title: 'Job Completed',
      message: `"${request.title}" has been marked as completed. Please leave a review!`,
      data: { requestId, providerId }
    });

    return updatedRequest;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(
    requestId: number,
    userId: number,
    reason?: string
  ): Promise<ServiceRequest> {
    const request = await ServiceRequest.query().findById(requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    // Check authorization
    const isOwner = request.user_id === userId;
    const isProvider = request.assigned_provider_id === userId;

    if (!isOwner && !isProvider) {
      throw new Error('Unauthorized to cancel this request');
    }

    if (request.status === 'completed' || request.status === 'cancelled') {
      throw new Error('Request cannot be cancelled');
    }

    const updatedRequest = await ServiceRequest.query()
      .patchAndFetchById(requestId, {
        status: 'cancelled'
      });

    // Notify the other party
    if (isOwner && request.assigned_provider_id) {
      await notificationService.createNotification({
        userId: request.assigned_provider_id,
        type: 'job_cancelled',
        title: 'Job Cancelled',
        message: `Customer cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
        data: { requestId, reason }
      });
    } else if (isProvider) {
      await notificationService.createNotification({
        userId: request.user_id,
        type: 'job_cancelled',
        title: 'Job Cancelled',
        message: `Provider cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
        data: { requestId, reason }
      });
    }

    return updatedRequest;
  }

  /**
   * Get user's service requests
   */
  async getUserRequests(userId: number, status?: RequestStatus): Promise<ServiceRequest[]> {
    let query = ServiceRequest.query()
      .where('user_id', userId)
      .withGraphFetched('[category, tier, assignedProvider]')
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    return query;
  }

  /**
   * Get provider's assignments
   */
  async getProviderAssignments(
    providerId: number,
    status?: RequestStatus
  ): Promise<ServiceRequest[]> {
    let query = ServiceRequest.query()
      .where('assigned_provider_id', providerId)
      .withGraphFetched('[user, category, tier]')
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    return query;
  }

  /**
   * Get request details with authorization
   */
  async getRequestDetails(requestId: number, userId: number): Promise<ServiceRequest | undefined> {
    const request = await ServiceRequest.query()
      .findById(requestId)
      .withGraphFetched('[user, category, tier, assignedProvider]');

    if (!request) {
      return undefined;
    }

    // Check authorization
    const isOwner = request.user_id === userId;
    const isAssignedProvider = request.assigned_provider_id === userId;

    if (!isOwner && !isAssignedProvider) {
      throw new Error('Unauthorized to view this request');
    }

    return request;
  }

  /**
   * Get assigned provider info for a request
   */
  async getAssignedProvider(requestId: number): Promise<User | null> {
    const request = await ServiceRequest.query()
      .findById(requestId)
      .select('assigned_provider_id');

    if (!request || !request.assigned_provider_id) {
      return null;
    }

    const provider = await User.query()
      .findById(request.assigned_provider_id)
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'profile_image',
        'average_rating',
        'total_jobs_completed'
      ]);

    return provider || null;
  }

  /**
   * List accepted providers (partial details if pending; full for confirmed provider when assigned)
   */
  async getAcceptedProvidersForCustomer(
    requestId: number,
    customerId: number
  ): Promise<{ providers: any[]; status: RequestStatus } | null> {
    const request = await ServiceRequest.query().findById(requestId);
    if (!request) return null;
    if (request.user_id !== customerId) {
      throw new Error('Unauthorized to view accepted providers');
    }

    if (request.status === 'assigned' && request.assigned_provider_id) {
      // Return only confirmed provider with contact details
      const provider = await User.query()
        .findById(request.assigned_provider_id)
        .select([
          'id',
          'first_name',
          'last_name',
          'email',
          'phone',
          'profile_image',
          'average_rating',
          'total_jobs_completed'
        ]);
      return { providers: provider ? [provider] : [], status: request.status };
    }

    // Pending: return partial details for all acceptances
    const acceptances = await RequestAcceptance.query()
      .where('request_id', requestId)
      .select(['provider_id']);
    const providerIds = acceptances.map(a => a.provider_id);
    if (providerIds.length === 0) return { providers: [], status: request.status };

    const providers = await User.query()
      .whereIn('id', providerIds)
      .select([
        'id',
        'first_name',
        'last_name',
        'profile_image',
        'average_rating',
        'total_jobs_completed'
      ]);

    return { providers, status: request.status };
  }
}

export const requestService = new RequestService();
