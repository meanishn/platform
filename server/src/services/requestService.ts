/**
 * Request Service - Assignment-Based Model
 * 
 * Handles service request lifecycle according to Technical Spec v1.1
 * NO proposals - automatic provider matching and assignment
 */

import ServiceRequest, { RequestStatus, UrgencyLevel } from '../models/ServiceRequest';
import User from '../models/User';
import RequestEligibleProvider from '../models/RequestEligibleProvider';
import { matchingService } from './matchingService';
import { notificationService } from './notificationService';
import type { 
  ServiceRequestDto, 
  ServiceRequestDetailDto,
  ServiceRequestListItemDto,
  ProviderJobDetailDto,
  ProviderAssignmentDto,
  JobDto,
  PublicUserDto,
  CustomerWithContactDto,
  ProviderWithContactDto,
  CreateServiceRequestDto
} from '../../../shared-types';
import { 
  toPublicUserDto,
  toServiceRequestDto,
  toServiceRequestDetailDto,
  toServiceRequestListItemDto,
  toProviderAssignmentDto,
  toProviderWithContactDto
} from '../sanitizers';

export class RequestService {
  /**
   * Create a new service request with automatic provider matching
   * This triggers the automatic matching algorithm
   * @param userId - Authenticated user ID (from auth context)
   * @param data - Request data from client (CreateServiceRequestDto)
   */
  async createRequest(userId: number, data: CreateServiceRequestDto): Promise<ServiceRequestDto> {

    console.log('images at insert:', data.images);
    console.log('JSON.stringify(images):', JSON.stringify(data.images));

    // Create the request
    const request = await ServiceRequest.query().insertAndFetch({
      user_id: userId,
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

    return toServiceRequestDto(request);
  }

  /**
   * Provider accepts an assignment
   * First provider to accept gets the job
   */
  async acceptAssignment(requestId: number, providerId: number): Promise<ServiceRequestDetailDto> {
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

    // Update eligible providers table with acceptance
    // Only update if provider was eligible (safety check)
    const eligibleRecord = await RequestEligibleProvider.query()
      .where({ request_id: requestId, provider_id: providerId })
      .first();
    
    if (eligibleRecord) {
      await RequestEligibleProvider.query()
        .patch({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where({ request_id: requestId, provider_id: providerId });
    } else {
      console.warn(`⚠️ Provider ${providerId} not found in eligible providers for request ${requestId}`);
    }

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

    return toServiceRequestDetailDto(request);
  }

  /**
   * Customer confirms a provider among acceptances
   * Updates BOTH service_requests and request_eligible_providers tables in transaction
   */
  async confirmProvider(requestId: number, customerId: number, providerId: number): Promise<ServiceRequestDto> {
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

    // Ensure provider was eligible and has accepted
    const eligibleRecord = await RequestEligibleProvider.query()
      .where({ request_id: requestId, provider_id: providerId })
      .first();
    
    if (!eligibleRecord) {
      throw new Error('Selected provider was not eligible for this request');
    }
    
    if (eligibleRecord.status !== 'accepted') {
      throw new Error('Selected provider has not accepted this request');
    }

    // TRANSACTION: Update both tables atomically
    const knex = ServiceRequest.knex();
    await knex.transaction(async (trx) => {
      // 1. Update service_requests table (job-level status)
      await ServiceRequest.query(trx).patchAndFetchById(requestId, {
        status: 'assigned',
        assigned_provider_id: providerId,
        assigned_at: new Date().toISOString(),
        provider_accepted_at: new Date().toISOString()
      });

      // 2. Update selected provider status to 'selected'
      await RequestEligibleProvider.query(trx)
        .patch({
          status: 'selected',
          selected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where({ request_id: requestId, provider_id: providerId });

      // 3. Update rejected providers (those who accepted but weren't selected)
      await RequestEligibleProvider.query(trx)
        .patch({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .where('request_id', requestId)
        .where('provider_id', '!=', providerId)
        .whereNotNull('accepted_at'); // Only those who actually accepted
    });

    // Get updated request for response
    const updated = await ServiceRequest.query().findById(requestId);
    if (!updated) {
      throw new Error('Failed to retrieve updated request');
    }

    // Notify selected provider
    await notificationService.createNotification({
      userId: providerId,
      type: 'assignment_confirmed',
      title: 'Assignment confirmed',
      message: `Customer confirmed you for "${request.title}".`,
      data: { requestId }
    });

    // Notify rejected providers (those who accepted but weren't selected)
    const rejectedProviders = await RequestEligibleProvider.query()
      .where('request_id', requestId)
      .where('status', 'rejected')
      .select('provider_id');

    for (const rejected of rejectedProviders) {
      await notificationService.createNotification({
        userId: rejected.provider_id,
        type: 'assignment_not_selected',
        title: 'Customer selected another provider',
        message: `The customer chose a different provider for "${request.title}".`,
        data: { requestId }
      });
    }

    // Notify customer confirmation success
    await notificationService.createNotification({
      userId: request.user_id,
      type: 'assignment_confirmed_customer',
      title: 'Provider confirmed',
      message: `You confirmed a provider for "${request.title}".`,
      data: { requestId, providerId }
    });

    console.log(`✅ Customer ${customerId} confirmed provider ${providerId} for request ${requestId}`);

    return toServiceRequestDto(updated);
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
  async startJob(requestId: number, providerId: number): Promise<ServiceRequestDto> {
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

    return toServiceRequestDto(updatedRequest);
  }

  /**
   * Complete a job
   */
  async completeJob(requestId: number, providerId: number): Promise<ServiceRequestDto> {
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

    return toServiceRequestDto(updatedRequest);
  }

  /**
   * Cancel a request with enhanced status coordination
   * Handles all cancellation scenarios with proper state updates
   */
  async cancelRequest(
    requestId: number,
    userId: number,
    reason?: string
  ): Promise<ServiceRequestDto> {
    const request = await ServiceRequest.query()
      .findById(requestId)
      .withGraphFetched('assignedProvider');
    
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

    const cancelledBy = isOwner ? 'customer' : 'provider';
    const cancellationStage = request.status; // 'pending', 'assigned', or 'in_progress'
    
    const knex = ServiceRequest.knex();
    await knex.transaction(async (trx) => {
      // SCENARIO: Provider cancels BEFORE work starts → Reopen job
      if (isProvider && request.status === 'assigned') {
        // Reopen job to pending
        await ServiceRequest.query(trx)
          .patchAndFetchById(requestId, {
            status: 'pending',
            assigned_provider_id: undefined,
            cancelled_at: new Date().toISOString(),
            cancelled_by: cancelledBy,
            cancellation_reason: reason,
            cancellation_stage: cancellationStage
          });
        
        // Update cancelling provider
        await RequestEligibleProvider.query(trx)
          .patch({
            status: 'cancelled_by_provider',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .where({ request_id: requestId, provider_id: userId });
        
        // Reopen for previously rejected providers
        await RequestEligibleProvider.query(trx)
          .patch({
            status: 'eligible',
            updated_at: new Date().toISOString()
          })
          .where('request_id', requestId)
          .where('status', 'rejected');
        
        // Re-notify eligible providers
        const eligibleProviders = await RequestEligibleProvider.query(trx)
          .where('request_id', requestId)
          .where('status', 'eligible')
          .select('provider_id');
        
        for (const ep of eligibleProviders) {
          await notificationService.createNotification({
            userId: ep.provider_id,
            type: 'job_reopened',
            title: 'Job Available Again',
            message: `"${request.title}" is available - previous provider cancelled`,
            data: { requestId }
          });
        }
        
        // Notify customer
        await notificationService.createNotification({
          userId: request.user_id,
          type: 'provider_cancelled',
          title: 'Provider Cancelled',
          message: `Provider cancelled "${request.title}". Job reopened for other providers.`,
          data: { requestId, reason }
        });
      }
      // SCENARIO: Customer cancels OR Provider cancels in-progress
      else {
        // Mark request as cancelled
        await ServiceRequest.query(trx)
          .patchAndFetchById(requestId, {
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: cancelledBy,
            cancellation_reason: reason,
            cancellation_stage: cancellationStage
          });
        
        // Determine provider status update
        let providerStatus: 'cancelled_unassigned' | 'cancelled_assigned' | 'cancelled_in_progress';
        if (cancellationStage === 'pending') {
          providerStatus = 'cancelled_unassigned';
        } else if (cancellationStage === 'assigned') {
          providerStatus = 'cancelled_assigned';
        } else {
          providerStatus = 'cancelled_in_progress';
        }
        
        if (cancellationStage === 'pending') {
          // Update ALL eligible providers who were notified or accepted
          await RequestEligibleProvider.query(trx)
            .patch({
              status: providerStatus,
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .where('request_id', requestId)
            .whereIn('status', ['notified', 'accepted']);
          
          // Notify all who accepted
          const acceptedProviders = await RequestEligibleProvider.query(trx)
            .where('request_id', requestId)
            .whereNotNull('accepted_at')
            .select('provider_id');
          
          for (const ep of acceptedProviders) {
            await notificationService.createNotification({
              userId: ep.provider_id,
              type: 'job_cancelled',
              title: 'Job Cancelled',
              message: `Customer cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
              data: { requestId, reason }
            });
          }
        } else {
          // Update only selected provider
          await RequestEligibleProvider.query(trx)
            .patch({
              status: providerStatus,
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .where({ request_id: requestId, status: 'selected' });
          
          // Notify the affected party
          if (isOwner && request.assigned_provider_id) {
            await notificationService.createNotification({
              userId: request.assigned_provider_id,
              type: 'job_cancelled',
              title: 'Job Cancelled',
              message: `Customer cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
              data: { requestId, reason, stage: cancellationStage }
            });
          } else if (isProvider) {
            await notificationService.createNotification({
              userId: request.user_id,
              type: 'job_cancelled',
              title: 'Job Cancelled',
              message: `Provider cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
              data: { requestId, reason, stage: cancellationStage }
            });
          }
        }
      }
    });

    const updatedRequest = await ServiceRequest.query().findById(requestId);
    if (!updatedRequest) {
      throw new Error('Failed to retrieve updated request');
    }

    console.log(`✅ Request ${requestId} cancelled by ${cancelledBy} at stage ${cancellationStage}`);

    return toServiceRequestDto(updatedRequest);
  }

  /**
   * Get user's service requests
   */
  async getUserRequests(userId: number, status?: RequestStatus): Promise<ServiceRequestListItemDto[]> {
    let query = ServiceRequest.query()
      .where('user_id', userId)
      .withGraphFetched('[category, tier, assignedProvider]')
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    const requests = await query;
    return requests.map(toServiceRequestListItemDto);
  }

  /**
   * Get provider's assignments (Active Work page)
   * Returns full assignment details with customer contact info for assigned jobs
   */
  async getProviderAssignments(
    providerId: number,
    status?: RequestStatus
  ): Promise<ProviderAssignmentDto[]> {
    // Build base query
    let query = ServiceRequest.query()
      .where('assigned_provider_id', providerId)
      .withGraphFetched('[user, category, tier]')
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    const requests = await query;
    
    // Get eligibility records for metadata (match_score, distance, etc.)
    const requestIds = requests.map(r => r.id);
    const eligibleRecords = requestIds.length > 0 
      ? await RequestEligibleProvider.query()
          .whereIn('request_id', requestIds)
          .where('provider_id', providerId)
      : [];
    
    const eligibleMap = new Map(
      eligibleRecords.map(r => [r.request_id, r])
    );
    
    // Convert to ProviderAssignmentDto with full details
    return requests.map(request => {
      const eligibleRecord = eligibleMap.get(request.id);
      return toProviderAssignmentDto(request, eligibleRecord);
    });
  }

  /**
   * Get available jobs for provider (jobs they were notified about and can accept)
   * Returns requests where:
   * - Provider received a notification (type: new_assignment)
   * - Request is still pending or pending_selection
   * - Provider hasn't accepted or declined yet
   */
  /**
   * Get available jobs for provider
   * NEW: Query request_eligible_providers table with matching metadata
   */
  async getAvailableJobs(providerId: number): Promise<JobDto[]> {
    // Find all requests where provider is eligible and can still accept
    const eligibleRecords = await RequestEligibleProvider.query()
      .where('provider_id', providerId)
      .whereIn('status', ['eligible', 'notified']) // Can accept
      .select('request_id', 'match_score', 'distance_miles', 'rank','notified_at');

    if (eligibleRecords.length === 0) {
      return [];
    }

    const requestIds = eligibleRecords.map(r => r.request_id);

    // Get requests that are still pending (not yet assigned)
    const requests = await ServiceRequest.query()
      .whereIn('id', requestIds)
      .where('status', 'pending') // Job still open
      .where(function() {
        // Not expired
        this.whereNull('expires_at')
          .orWhere('expires_at', '>', new Date().toISOString());
      })
      .withGraphFetched('[user, category, tier]')
      .orderBy('created_at', 'desc');

    // Enrich with matching metadata
    const eligibleMap = new Map(
      eligibleRecords.map(r => [r.request_id, r])
    );

    return requests.map(request => {
      const eligible = eligibleMap.get(request.id);
      const dto = toServiceRequestListItemDto(request);
      
      // Add matching metadata
      if (eligible) {
        return {
          ...dto,
          matchScore: eligible.match_score,
          distanceMiles: eligible.distance_miles ? Number(eligible.distance_miles) : undefined,
          rank: eligible.rank
        };
      }
      
      return dto;
    });
  }

  /**
   * Get request details with authorization
   */
  async getRequestDetails(requestId: number, userId: number): Promise<ServiceRequestDetailDto | undefined> {
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

    // Pass isAssignedProvider flag for progressive disclosure of customer contact info
    return toServiceRequestDetailDto(request, isAssignedProvider);
  }

  /**
   * Get provider-specific job details with match metadata
   * Cleaner API for provider views - no assignedProvider confusion
   */
  async getProviderJobDetails(requestId: number, providerId: number): Promise<ProviderJobDetailDto | undefined> {
    // Get request with user, category, and tier
    const request = await ServiceRequest.query()
      .findById(requestId)
      .withGraphFetched('[user, category, tier]');

    if (!request) {
      return undefined;
    }

    // Check if provider is eligible or assigned using typed model
    const eligibilityRecord = await RequestEligibleProvider.query()
      .where({ request_id: requestId, provider_id: providerId })
      .first();

    const isAssignedProvider = request.assigned_provider_id === providerId;

    // Provider must be either eligible or assigned
    if (!eligibilityRecord && !isAssignedProvider) {
      throw new Error('Unauthorized to view this request');
    }

    // Build customer object with progressive disclosure
    let customer: PublicUserDto = {
      id: request.user!.id,
      firstName: request.user!.first_name || '',
      lastName: request.user!.last_name || '',
      profileImage: request.user!.profile_image || undefined,
      averageRating: request.user!.average_rating || undefined,
      role: 'customer'
    };

    // Add contact information only for assigned provider
    if (isAssignedProvider) {
      customer = {
        ...customer,
        email: request.user!.email,
        phone: request.user!.phone || undefined
      } as CustomerWithContactDto;
    }

    // Parse images
    let images: string[] | undefined;
    if (request.images) {
      try {
        images = typeof request.images === 'string' 
          ? JSON.parse(request.images) 
          : request.images;
      } catch {
        images = undefined;
      }
    }

    return {
      id: request.id,
      title: request.title,
      description: request.description,
      address: request.address,
      latitude: request.latitude,
      longitude: request.longitude,
      preferredDate: request.preferred_date || undefined,
      urgency: request.urgency,
      estimatedHours: request.estimated_hours || undefined,
      images,
      status: request.status,
      assignedProviderId: request.assigned_provider_id || undefined,
      assignedAt: request.assigned_at || undefined,
      startedAt: request.started_at || undefined,
      completedAt: request.completed_at || undefined,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      customer,
      category: {
        id: request.category!.id,
        name: request.category!.name,
        description: request.category!.description || undefined,
        icon: request.category!.icon || undefined,
        isActive: request.category!.is_active
      },
      tier: {
        id: request.tier!.id,
        categoryId: request.tier!.category_id,
        name: request.tier!.name,
        description: request.tier!.description || undefined,
        baseHourlyRate: request.tier!.base_hourly_rate,
        isActive: request.tier!.is_active
      },
      // Match metadata from eligibility record
      matchScore: eligibilityRecord?.match_score || undefined,
      rank: eligibilityRecord?.rank || undefined,
      distanceMiles: eligibilityRecord?.distance_miles ? Number(eligibilityRecord.distance_miles) : undefined,
      eligibilityStatus: eligibilityRecord?.status || undefined
    };
  }

  /**
   * Get assigned provider info for a request
   * Returns sanitized ProviderWithContactDto
   */
  async getAssignedProvider(requestId: number): Promise<ProviderWithContactDto | null> {
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
        'total_jobs_completed',
        'role',
        'provider_bio',
        'provider_skills',
        'response_time_average',
        'is_available'
      ]);

    if (!provider) {
      return null;
    }

    // ✅ Sanitize to DTO (single source of truth)
    return toProviderWithContactDto(provider);
  }

  /**
   * List accepted providers (partial details if pending; full for confirmed provider when assigned)
   */
  async getAcceptedProvidersForCustomer(
    requestId: number,
    customerId: number
  ): Promise<{ providers: PublicUserDto[]; status: RequestStatus } | null> {
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
      return { providers: provider ? [toPublicUserDto(provider)] : [], status: request.status };
    }

    
    // Find all requests where provider accepted but customer hasn't chosen yet
    const eligibleRecords = await RequestEligibleProvider.query()
      .where('request_id', requestId)
      .where('status', 'accepted') // Provider accepted, waiting for customer
      .select('request_id', 'provider_id', 'match_score', 'distance_miles', 'rank', 'accepted_at', 'notified_at');

    const providerIds = eligibleRecords.map(a => a.provider_id);
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

    const res = providers.map(toPublicUserDto);
    return { providers: res, status: request.status };
  }

  /**
   * Get jobs provider accepted but customer hasn't selected yet
   * NEW: Returns requests where provider.status = 'accepted'
   */
  async getAcceptedPendingJobs(providerId: number): Promise<JobDto[]> {
    // Find all requests where provider accepted but customer hasn't chosen yet
    const eligibleRecords = await RequestEligibleProvider.query()
      .where('provider_id', providerId)
      .where('status', 'accepted') // Provider accepted, waiting for customer
      .select('request_id', 'match_score', 'distance_miles', 'rank', 'accepted_at', 'notified_at');

    if (eligibleRecords.length === 0) {
      return [];
    }

    const requestIds = eligibleRecords.map(r => r.request_id);

    // Get requests still in pending status (not yet assigned)
    const requests = await ServiceRequest.query()
      .whereIn('id', requestIds)
      .where('status', 'pending') // Job still open
      .withGraphFetched('[user, category, tier]')
      .orderBy('created_at', 'desc');

    // Enrich with matching metadata
    const eligibleMap = new Map(
      eligibleRecords.map(r => [r.request_id, r])
    );

    return requests.map(request => {
      const eligible = eligibleMap.get(request.id);
      const dto = toServiceRequestListItemDto(request);
      
      if (eligible) {
        return {
          ...dto,
          matchScore: eligible.match_score,
          distanceMiles: eligible.distance_miles ? Number(eligible.distance_miles) : undefined,
          rank: eligible.rank
        };
      }
      
      return dto;
    });
  }

  /**
   * Get eligible providers for a request (admin/debugging)
   */
  async getEligibleProviders(requestId: number): Promise<any[]> {
    const eligible = await RequestEligibleProvider.query()
      .where('request_id', requestId)
      .withGraphFetched('provider')
      .orderBy('rank', 'asc');

    return eligible.map(e => ({
      providerId: e.provider_id,
      providerName: e.provider ? `${e.provider.first_name} ${e.provider.last_name}` : 'Unknown',
      matchScore: e.match_score,
      distanceMiles: e.distance_miles ? Number(e.distance_miles) : undefined,
      rank: e.rank,
      status: e.status,
      notifiedAt: e.notified_at,
      acceptedAt: e.accepted_at,
      selectedAt: e.selected_at,
      cancelledAt: e.cancelled_at
    }));
  }

  /**
   * Check if provider is eligible for a request
   */
  async isProviderEligible(requestId: number, providerId: number): Promise<boolean> {
    const record = await RequestEligibleProvider.query()
      .where({ request_id: requestId, provider_id: providerId })
      .first();
    
    return !!record;
  }

  /**
   * Get cancelled jobs for provider (analytics)
   */
  async getCancelledJobs(providerId: number): Promise<ServiceRequestListItemDto[]> {
    const eligibleRecords = await RequestEligibleProvider.query()
      .where('provider_id', providerId)
      .whereIn('status', [
        'cancelled_unassigned',
        'cancelled_assigned',
        'cancelled_by_provider',
        'cancelled_in_progress'
      ])
      .select('request_id', 'match_score', 'distance_miles', 'rank', 'cancelled_at');

    if (eligibleRecords.length === 0) {
      return [];
    }

    const requestIds = eligibleRecords.map(r => r.request_id);

    const requests = await ServiceRequest.query()
      .whereIn('id', requestIds)
      .where('status', 'cancelled')
      .withGraphFetched('[user, category, tier]')
      .orderBy('cancelled_at', 'desc');

    const eligibleMap = new Map(
      eligibleRecords.map(r => [r.request_id, r])
    );

    return requests.map(request => {
      const eligible = eligibleMap.get(request.id);
      const dto = toServiceRequestListItemDto(request);
      
      if (eligible) {
        return {
          ...dto,
          matchScore: eligible.match_score,
          distanceMiles: eligible.distance_miles ? Number(eligible.distance_miles) : undefined,
          rank: eligible.rank
        };
      }
      
      return dto;
    });
  }

  /**
   * Unified provider action handler
   * Handles: accept, decline, start, complete, cancel
   */
  async performProviderAction(
    requestId: number,
    providerId: number,
    action: 'accept' | 'decline' | 'start' | 'complete' | 'cancel',
    reason?: string
  ): Promise<{ success: boolean; message: string; data: any }> {   
    try {
      switch (action) {
        case 'accept':
          await this.acceptAssignment(requestId, providerId);
          return {
            success: true,
            message: 'Job accepted successfully',
            data: { requestId, status: 'accepted', nextAction: 'wait_for_customer_selection' }
          };

        case 'decline':
          await this.declineEligibleJob(requestId, providerId, reason);
          return {
            success: true,
            message: 'Job declined',
            data: { requestId, status: 'rejected' }
          };

        case 'start':
          const startedRequest = await this.startJob(requestId, providerId);
          return {
            success: true,
            message: 'Job started successfully',
            data: { requestId, status: 'in_progress', nextAction: 'complete_job' }
          };

        case 'complete':
          const completedRequest = await this.completeJob(requestId, providerId);
          return {
            success: true,
            message: 'Job completed successfully',
            data: { requestId, status: 'completed', nextAction: 'await_customer_review' }
          };

        case 'cancel':
          if (!reason) {
            throw new Error('Cancellation reason is required');
          }
          const cancelledRequest = await this.cancelRequest(requestId, providerId, reason);
          const reopened = cancelledRequest.status === 'pending';
          return {
            success: true,
            message: reopened ? 'Job cancelled and reopened for other providers' : 'Job cancelled successfully',
            data: { requestId, status: cancelledRequest.status, reopened }
          };

        default:
          throw new Error(`Invalid action: ${action}`);
      }
    } catch (error) {
      throw error; // Let controller handle error response
    }
  }

  /**
   * Provider declines an eligible job (FIXED version)
   * Updates request_eligible_providers table properly
   */
  async declineEligibleJob(
    requestId: number,
    providerId: number,
    reason?: string
  ): Promise<void> {
    const knex = ServiceRequest.knex();

    await knex.transaction(async (trx) => {
      // Check if provider is eligible to decline
      const eligible = await RequestEligibleProvider.query(trx)
        .where({ request_id: requestId, provider_id: providerId })
        .whereIn('status', ['eligible', 'notified', 'accepted'])
        .first();

      if (!eligible) {
        throw new Error('You are not eligible to decline this job');
      }

      // Check request is still pending
      const request = await ServiceRequest.query(trx).findById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      if (request.status !== 'pending') {
        console.warn(`Provider ${providerId} tried to decline request ${requestId} with status ${request.status}`);
        return; // Job already assigned/cancelled
      }

      // Update request_eligible_providers table
      await RequestEligibleProvider.query(trx)
        .patch({
          status: 'rejected',
          updated_at: knex.fn.now()
        })
        .where({ request_id: requestId, provider_id: providerId });

      // Update provider stats
      const provider = await User.query(trx).findById(providerId);
      if (provider) {
        await User.query(trx)
          .patchAndFetchById(providerId, {
            total_jobs_declined: (provider.total_jobs_declined || 0) + 1
          });
      }

      console.log(`❌ Provider ${providerId} declined request ${requestId}${reason ? `: ${reason}` : ''}`);
    });
  }
}

export const requestService = new RequestService();
