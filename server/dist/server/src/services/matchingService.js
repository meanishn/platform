"use strict";
/**
 * Provider Matching Service
 *
 * Implements automatic provider matching algorithm as per Technical Spec v1.1
 * Core business logic for the assignment-based service coordination platform
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
exports.matchingService = exports.MatchingService = void 0;
const User_1 = __importDefault(require("../models/User"));
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const notificationService_1 = require("./notificationService");
const MAX_CONCURRENT_ASSIGNMENTS = 5;
const TOP_PROVIDERS_TO_NOTIFY = 5;
class MatchingService {
    /**
     * Find and notify qualified providers for a service request
     * This is the core automatic matching algorithm
     */
    matchProvidersToRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const tierName = this.getTierNameFromId(request.tier_id);
            const criteria = {
                categoryId: request.category_id,
                tierId: request.tier_id,
                tierName,
                latitude: request.latitude,
                longitude: request.longitude,
                urgency: request.urgency
            };
            // Step 1: Filter qualified providers
            const qualifiedProviders = yield this.findQualifiedProviders(criteria);
            console.log(`🔍 Found ${qualifiedProviders.length} qualified providers for request ${request.id}`);
            if (qualifiedProviders.length === 0) {
                console.warn(`⚠️ No qualified providers found for request ${request.id}`);
                yield notificationService_1.notificationService.createNotification({
                    userId: request.user_id,
                    type: 'no_providers',
                    title: 'No Providers Available',
                    message: 'We couldn\'t find any available providers for your request. We\'ll notify you when providers become available.',
                    data: { requestId: request.id }
                });
                return;
            }
            // Step 2: Score and sort providers
            const scoredProviders = this.scoreProviders(qualifiedProviders, criteria);
            // Step 3: Notify top candidates
            const topProviders = scoredProviders.slice(0, TOP_PROVIDERS_TO_NOTIFY);
            yield this.notifyProviders(topProviders, request);
            console.log(`✅ Notified ${topProviders.length} providers for request ${request.id}`);
        });
    }
    /**
     * Find all providers that meet the qualification criteria
     */
    findQualifiedProviders(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get active assignments per provider to check concurrent limits
            const activeAssignmentsCount = yield ServiceRequest_1.default.query()
                .select('assigned_provider_id')
                .count('* as count')
                .whereIn('status', ['assigned', 'in_progress'])
                .whereNotNull('assigned_provider_id')
                .groupBy('assigned_provider_id')
                .then(results => {
                const map = new Map();
                results.forEach((r) => {
                    map.set(r.assigned_provider_id, parseInt(r.count));
                });
                return map;
            });
            // Query providers with their category qualifications
            const providers = yield User_1.default.query()
                .where('is_service_provider', true)
                .where('provider_status', 'approved')
                .where('is_available', true)
                .withGraphFetched('providerCategories')
                .modifyGraph('providerCategories', builder => {
                builder.where('category_id', criteria.categoryId)
                    .where('is_verified', true);
            });
            // Filter providers based on:
            // 1. Have the required category
            // 2. Have the required tier qualification
            // 3. Not exceeding max concurrent assignments
            const qualified = providers.filter(provider => {
                var _a, _b;
                const categoryQualification = (_a = provider.providerCategories) === null || _a === void 0 ? void 0 : _a.find(pc => pc.category_id === criteria.categoryId);
                if (!categoryQualification)
                    return false;
                // Check tier qualification
                const hasTierQualification = (_b = categoryQualification.qualified_tiers) === null || _b === void 0 ? void 0 : _b.includes(criteria.tierName);
                if (!hasTierQualification)
                    return false;
                // Check concurrent assignment limit
                const activeCount = activeAssignmentsCount.get(provider.id) || 0;
                if (activeCount >= MAX_CONCURRENT_ASSIGNMENTS) {
                    console.log(`Provider ${provider.id} skipped - max concurrent assignments reached (${activeCount})`);
                    return false;
                }
                return true;
            });
            return qualified;
        });
    }
    /**
     * Score providers based on multiple factors and sort by priority
     */
    scoreProviders(providers, criteria) {
        return providers.map(provider => {
            const distance = this.calculateDistance(criteria.latitude, criteria.longitude, provider.latitude || 0, provider.longitude || 0);
            const score = this.calculateProviderScore({
                distance,
                rating: provider.average_rating || 0,
                completionRate: this.calculateCompletionRate(provider),
                responseTime: provider.response_time_average || 999,
                totalJobsCompleted: provider.total_jobs_completed,
                urgency: criteria.urgency
            });
            return { provider, score, distance };
        }).sort((a, b) => b.score - a.score);
    }
    /**
     * Calculate provider priority score based on multiple weighted factors
     */
    calculateProviderScore(params) {
        const { distance, rating, completionRate, responseTime, totalJobsCompleted, urgency } = params;
        // Weighted scoring algorithm
        let score = 0;
        // Distance score (closer is better) - 30% weight
        // Inverse exponential decay: closer providers get much higher scores
        const distanceScore = Math.exp(-distance / 10) * 100;
        score += distanceScore * 0.3;
        // Rating score (5 stars max) - 25% weight
        const ratingScore = (rating / 5) * 100;
        score += ratingScore * 0.25;
        // Completion rate - 20% weight
        score += completionRate * 0.2;
        // Response time (faster is better) - 15% weight
        // Assume target response time is 15 minutes
        const responseScore = Math.max(0, 100 - (responseTime / 15) * 100);
        score += responseScore * 0.15;
        // Experience (total jobs) - 10% weight
        // Logarithmic scale to prevent dominance by very experienced providers
        const experienceScore = Math.min(100, Math.log(totalJobsCompleted + 1) * 20);
        score += experienceScore * 0.1;
        // Urgency multiplier
        if (urgency === 'emergency') {
            // For emergencies, prioritize response time and distance
            score *= 1.2;
        }
        return score;
    }
    /**
     * Calculate distance between two coordinates in miles (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Calculate provider completion rate
     */
    calculateCompletionRate(provider) {
        const total = provider.total_jobs_completed + provider.total_jobs_declined;
        if (total === 0)
            return 50; // Default for new providers
        return (provider.total_jobs_completed / total) * 100;
    }
    /**
     * Send notifications to selected providers
     */
    notifyProviders(scoredProviders, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseWindow = this.getResponseWindow(request.urgency);
            const expiresAt = new Date(Date.now() + responseWindow * 60 * 1000);
            for (const { provider, distance } of scoredProviders) {
                yield notificationService_1.notificationService.createNotification({
                    userId: provider.id,
                    type: 'new_assignment',
                    title: 'New Service Request Available',
                    message: `${request.title} - ${request.urgency} priority${distance ? ` (${distance.toFixed(1)} miles away)` : ''}`,
                    data: {
                        requestId: request.id,
                        categoryId: request.category_id,
                        tierId: request.tier_id,
                        urgency: request.urgency,
                        estimatedHours: request.estimated_hours,
                        address: request.address,
                        distance,
                        expiresAt: expiresAt.toISOString(),
                        actionUrl: `/provider/assignments`,
                        actionText: 'View Assignment'
                    }
                });
            }
        });
    }
    /**
     * Get response window in minutes based on urgency
     */
    getResponseWindow(urgency) {
        switch (urgency) {
            case 'emergency':
                return 10; // 10 minutes
            case 'high':
                return 15; // 15 minutes
            case 'medium':
                return 30; // 30 minutes
            case 'low':
                return 60; // 1 hour
            default:
                return 30;
        }
    }
    /**
     * Map tier ID to tier name
     * Assumes tiers are in groups of 3: (1-3: Cat 1), (4-6: Cat 2), etc.
     */
    getTierNameFromId(tierId) {
        const tierIndex = (tierId - 1) % 3;
        const tierNames = ['basic', 'expert', 'premium'];
        return tierNames[tierIndex];
    }
    /**
     * Re-match request if all notified providers declined or timed out
     */
    rematchRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield ServiceRequest_1.default.query()
                .findById(requestId)
                .withGraphFetched('[category, tier]');
            if (!request) {
                console.error(`Request ${requestId} not found for rematching`);
                return;
            }
            if (request.status !== 'pending') {
                console.warn(`Request ${requestId} is not in pending status, skipping rematch`);
                return;
            }
            console.log(`🔄 Rematching request ${requestId}`);
            yield this.matchProvidersToRequest(request);
        });
    }
}
exports.MatchingService = MatchingService;
exports.matchingService = new MatchingService();
