"use strict";
/**
 * Request Service - Assignment-Based Model
 *
 * Handles service request lifecycle according to Technical Spec v1.1
 * NO proposals - automatic provider matching and assignment
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestService = exports.RequestService = void 0;
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const User_1 = __importDefault(require("../models/User"));
const RequestAcceptance_1 = __importDefault(require("../models/RequestAcceptance"));
const matchingService_1 = require("./matchingService");
const notificationService_1 = require("./notificationService");
/**
 * Mapper functions to convert model instances to DTOs
 */
function toServiceRequestDto(request) {
    // Parse images if stored as JSON string
    let images;
    if (request.images) {
        try {
            images = typeof request.images === 'string'
                ? JSON.parse(request.images)
                : request.images;
        }
        catch (_a) {
            images = [];
        }
    }
    return {
        id: request.id,
        userId: request.user_id,
        categoryId: request.category_id,
        tierId: request.tier_id,
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
        updatedAt: request.updated_at
    };
}
function toServiceRequestDetailDto(request) {
    const baseDto = toServiceRequestDto(request);
    return Object.assign(Object.assign({}, baseDto), { customer: {
            id: request.user.id,
            firstName: request.user.first_name || '',
            lastName: request.user.last_name || '',
            profileImage: request.user.profile_image || undefined,
            averageRating: request.user.average_rating || undefined,
            totalJobsCompleted: request.user.total_jobs_completed || 0,
            role: 'customer'
        }, category: {
            id: request.category.id,
            name: request.category.name,
            description: request.category.description || undefined,
            icon: request.category.icon || undefined,
            isActive: request.category.is_active
        }, tier: {
            id: request.tier.id,
            categoryId: request.tier.category_id,
            name: request.tier.name,
            description: request.tier.description || undefined,
            baseHourlyRate: request.tier.base_hourly_rate,
            isActive: request.tier.is_active
        }, assignedProvider: request.assignedProvider ? {
            id: request.assignedProvider.id,
            firstName: request.assignedProvider.first_name || '',
            lastName: request.assignedProvider.last_name || '',
            profileImage: request.assignedProvider.profile_image || undefined,
            averageRating: request.assignedProvider.average_rating || undefined,
            totalJobsCompleted: request.assignedProvider.total_jobs_completed || 0,
            role: 'provider',
            providerBio: request.assignedProvider.provider_bio || undefined,
            providerSkills: request.assignedProvider.provider_skills || undefined,
            responseTimeAverage: request.assignedProvider.response_time_average || undefined,
            isAvailable: request.assignedProvider.is_available || false,
            email: request.assignedProvider.email,
            phone: request.assignedProvider.phone || undefined
        } : undefined });
}
function toServiceRequestListItemDto(request) {
    // Parse images if stored as JSON string
    let images;
    if (request.images) {
        try {
            images = typeof request.images === 'string'
                ? JSON.parse(request.images)
                : request.images;
        }
        catch (_a) {
            images = [];
        }
    }
    return {
        id: request.id,
        title: request.title,
        description: request.description,
        address: request.address,
        status: request.status,
        urgency: request.urgency,
        estimatedHours: request.estimated_hours || undefined,
        preferredDate: request.preferred_date || undefined,
        createdAt: request.created_at,
        category: {
            id: request.category.id,
            name: request.category.name,
            icon: request.category.icon || undefined
        },
        tier: {
            id: request.tier.id,
            name: request.tier.name,
            baseHourlyRate: request.tier.base_hourly_rate
        }
    };
}
class RequestService {
    /**
     * Create a new service request with automatic provider matching
     * This triggers the automatic matching algorithm
     */
    createRequest(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('images at insert:', data.images);
            console.log('JSON.stringify(images):', JSON.stringify(data.images));
            // Create the request
            const request = yield ServiceRequest_1.default.query().insertAndFetch({
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
                images: JSON.stringify(data.images),
                status: 'pending'
            });
            console.log(`✅ Created service request ${request.id}`);
            // Automatically match and notify qualified providers (async, non-blocking)
            matchingService_1.matchingService.matchProvidersToRequest(request).catch(error => {
                console.error(`Error matching providers for request ${request.id}:`, error);
            });
            return toServiceRequestDto(request);
        });
    }
    /**
     * Provider accepts an assignment
     * First provider to accept gets the job
     */
    acceptAssignment(requestId, providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query()
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
            const provider = yield User_1.default.query()
                .findById(providerId)
                .withGraphFetched('providerCategories');
            if (!provider || !provider.isApprovedProvider) {
                throw new Error('Provider not authorized');
            }
            // Record provider acceptance (idempotent)
            yield RequestAcceptance_1.default.query().insert({
                request_id: requestId,
                provider_id: providerId
            }).onConflict(['request_id', 'provider_id']).ignore();
            // Keep request in 'pending' until customer confirms a provider
            // Notify customer of a new acceptance
            yield notificationService_1.notificationService.createNotification({
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
        });
    }
    /**
     * Customer confirms a provider among acceptances
     */
    confirmProvider(requestId, customerId, providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
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
            const acceptance = yield RequestAcceptance_1.default.query()
                .where({ request_id: requestId, provider_id: providerId })
                .first();
            if (!acceptance) {
                throw new Error('Selected provider has not accepted this request');
            }
            const updated = yield ServiceRequest_1.default.query().patchAndFetchById(requestId, {
                status: 'assigned',
                assigned_provider_id: providerId,
                assigned_at: new Date().toISOString(),
                provider_accepted_at: new Date().toISOString()
            });
            // Remove other acceptances
            yield RequestAcceptance_1.default.query()
                .delete()
                .where('request_id', requestId)
                .where('provider_id', '!=', providerId);
            // Notify selected provider
            yield notificationService_1.notificationService.createNotification({
                userId: providerId,
                type: 'assignment_confirmed',
                title: 'Assignment confirmed',
                message: `Customer confirmed you for "${request.title}".`,
                data: { requestId }
            });
            // Notify customer confirmation success
            yield notificationService_1.notificationService.createNotification({
                userId: request.user_id,
                type: 'assignment_confirmed_customer',
                title: 'Provider confirmed',
                message: `You confirmed ${providerId} for "${request.title}".`,
                data: { requestId, providerId }
            });
            return toServiceRequestDto(updated);
        });
    }
    /**
     * Provider declines an assignment
     */
    declineAssignment(requestId, providerId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }
            if (request.status !== 'pending') {
                console.warn(`Provider ${providerId} tried to decline request ${requestId} with status ${request.status}`);
                return; // Already assigned to someone else
            }
            // Update provider stats
            const provider = yield User_1.default.query().findById(providerId);
            if (provider) {
                yield User_1.default.query()
                    .patchAndFetchById(providerId, {
                    total_jobs_declined: (provider.total_jobs_declined || 0) + 1
                });
            }
            console.log(`❌ Provider ${providerId} declined request ${requestId}`);
            // Check if we need to rematch (if all notified providers declined)
            // This would be handled by a separate cron job or notification expiry system
        });
    }
    /**
     * Start work on assigned job
     */
    startJob(requestId, providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }
            if (request.assigned_provider_id !== providerId) {
                throw new Error('Only the assigned provider can start this job');
            }
            if (request.status !== 'assigned') {
                throw new Error('Job cannot be started from current status');
            }
            const updatedRequest = yield ServiceRequest_1.default.query()
                .patchAndFetchById(requestId, {
                status: 'in_progress',
                started_at: new Date().toISOString()
            });
            // Notify customer
            yield notificationService_1.notificationService.createNotification({
                userId: request.user_id,
                type: 'job_started',
                title: 'Work Started',
                message: `Work has started on "${request.title}"`,
                data: { requestId }
            });
            return toServiceRequestDto(updatedRequest);
        });
    }
    /**
     * Complete a job
     */
    completeJob(requestId, providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }
            if (request.assigned_provider_id !== providerId) {
                throw new Error('Only the assigned provider can complete this job');
            }
            if (request.status !== 'in_progress') {
                throw new Error('Job is not in progress');
            }
            const updatedRequest = yield ServiceRequest_1.default.query()
                .patchAndFetchById(requestId, {
                status: 'completed',
                completed_at: new Date().toISOString()
            });
            // Update provider stats
            const provider = yield User_1.default.query().findById(providerId);
            if (provider) {
                yield User_1.default.query()
                    .patchAndFetchById(providerId, {
                    total_jobs_completed: (provider.total_jobs_completed || 0) + 1
                });
            }
            // Notify customer
            yield notificationService_1.notificationService.createNotification({
                userId: request.user_id,
                type: 'job_completed',
                title: 'Job Completed',
                message: `"${request.title}" has been marked as completed. Please leave a review!`,
                data: { requestId, providerId }
            });
            return toServiceRequestDto(updatedRequest);
        });
    }
    /**
     * Cancel a request
     */
    cancelRequest(requestId, userId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
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
            const updatedRequest = yield ServiceRequest_1.default.query()
                .patchAndFetchById(requestId, {
                status: 'cancelled'
            });
            // Notify the other party
            if (isOwner && request.assigned_provider_id) {
                yield notificationService_1.notificationService.createNotification({
                    userId: request.assigned_provider_id,
                    type: 'job_cancelled',
                    title: 'Job Cancelled',
                    message: `Customer cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
                    data: { requestId, reason }
                });
            }
            else if (isProvider) {
                yield notificationService_1.notificationService.createNotification({
                    userId: request.user_id,
                    type: 'job_cancelled',
                    title: 'Job Cancelled',
                    message: `Provider cancelled "${request.title}"${reason ? `: ${reason}` : ''}`,
                    data: { requestId, reason }
                });
            }
            return toServiceRequestDto(updatedRequest);
        });
    }
    /**
     * Get user's service requests
     */
    getUserRequests(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = ServiceRequest_1.default.query()
                .where('user_id', userId)
                .withGraphFetched('[category, tier, assignedProvider]')
                .orderBy('created_at', 'desc');
            if (status) {
                query = query.where('status', status);
            }
            const requests = yield query;
            return requests.map(toServiceRequestListItemDto);
        });
    }
    /**
     * Get provider's assignments
     */
    getProviderAssignments(providerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = ServiceRequest_1.default.query()
                .where('assigned_provider_id', providerId)
                .withGraphFetched('[user, category, tier]')
                .orderBy('created_at', 'desc');
            if (status) {
                query = query.where('status', status);
            }
            const requests = yield query;
            return requests.map(toServiceRequestListItemDto);
        });
    }
    /**
     * Get request details with authorization
     */
    getRequestDetails(requestId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query()
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
            return toServiceRequestDetailDto(request);
        });
    }
    /**
     * Get assigned provider info for a request
     */
    getAssignedProvider(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query()
                .findById(requestId)
                .select('assigned_provider_id');
            if (!request || !request.assigned_provider_id) {
                return null;
            }
            const provider = yield User_1.default.query()
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
        });
    }
    /**
     * List accepted providers (partial details if pending; full for confirmed provider when assigned)
     */
    getAcceptedProvidersForCustomer(requestId, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query().findById(requestId);
            if (!request)
                return null;
            if (request.user_id !== customerId) {
                throw new Error('Unauthorized to view accepted providers');
            }
            if (request.status === 'assigned' && request.assigned_provider_id) {
                // Return only confirmed provider with contact details
                const provider = yield User_1.default.query()
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
            const acceptances = yield RequestAcceptance_1.default.query()
                .where('request_id', requestId)
                .select(['provider_id']);
            const providerIds = acceptances.map(a => a.provider_id);
            if (providerIds.length === 0)
                return { providers: [], status: request.status };
            const providers = yield User_1.default.query()
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
        });
    }
}
exports.RequestService = RequestService;
exports.requestService = new RequestService();
