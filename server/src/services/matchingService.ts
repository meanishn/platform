/**
 * Provider Matching Service
 * 
 * Implements automatic provider matching algorithm as per Technical Spec v1.1
 * Core business logic for the assignment-based service coordination platform
 */

import User from '../models/User';
import ServiceRequest from '../models/ServiceRequest';
import ProviderCategory from '../models/ProviderCategory';
import Notification from '../models/Notification';
import RequestEligibleProvider from '../models/RequestEligibleProvider';
import { notificationService } from './notificationService';

interface MatchScore {
  provider: User;
  score: number;
  distance?: number;
}

interface MatchingCriteria {
  categoryId: number;
  tierId: number;
  tierName: 'basic' | 'expert' | 'premium';
  latitude: number;
  longitude: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

const MAX_CONCURRENT_ASSIGNMENTS = 5;
const TOP_PROVIDERS_TO_NOTIFY = 5;

export class MatchingService {
  /**
   * Find and notify qualified providers for a service request
   * This is the core automatic matching algorithm
   */
  async matchProvidersToRequest(request: ServiceRequest): Promise<void> {
    const tierName = this.getTierNameFromId(request.tier_id);
    
    const criteria: MatchingCriteria = {
      categoryId: request.category_id,
      tierId: request.tier_id,
      tierName,
      latitude: request.latitude,
      longitude: request.longitude,
      urgency: request.urgency
    };

    // Step 1: Filter qualified providers
    const qualifiedProviders = await this.findQualifiedProviders(criteria);

    console.log(`🔍 Found ${qualifiedProviders.length} qualified providers for request ${request.id}`);

    if (qualifiedProviders.length === 0) {
      console.warn(`⚠️ No qualified providers found for request ${request.id}`);
      await notificationService.createNotification({
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

    // Step 3: Save ALL eligible providers to database with metadata
    await this.saveEligibleProviders(scoredProviders, request.id);

    // Step 4: Notify top candidates
    const topProviders = scoredProviders.slice(0, TOP_PROVIDERS_TO_NOTIFY);
    
    await this.notifyProviders(topProviders, request);

    console.log(`✅ Saved ${scoredProviders.length} eligible providers, notified top ${topProviders.length} for request ${request.id}`);
  }

  /**
   * Find all providers that meet the qualification criteria
   */
  private async findQualifiedProviders(criteria: MatchingCriteria): Promise<User[]> {
    // Get active assignments per provider to check concurrent limits
    const activeAssignmentsCount = await ServiceRequest.query()
      .select('assigned_provider_id')
      .count('* as count')
      .whereIn('status', ['assigned', 'in_progress'])
      .whereNotNull('assigned_provider_id')
      .groupBy('assigned_provider_id')
      .then(results => {
        const map = new Map<number, number>();
        results.forEach((r: any) => {
          map.set(r.assigned_provider_id, parseInt(r.count));
        });
        return map;
      });

    // Query providers with their category qualifications
    const providers = await User.query()
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
      const categoryQualification = provider.providerCategories?.find(
        pc => pc.category_id === criteria.categoryId
      );

      if (!categoryQualification) return false;

      // Check tier qualification
      const hasTierQualification = categoryQualification.qualified_tiers?.includes(criteria.tierName);
      if (!hasTierQualification) return false;

      // Check concurrent assignment limit
      const activeCount = activeAssignmentsCount.get(provider.id) || 0;
      if (activeCount >= MAX_CONCURRENT_ASSIGNMENTS) {
        console.log(`Provider ${provider.id} skipped - max concurrent assignments reached (${activeCount})`);
        return false;
      }

      return true;
    });

    return qualified;
  }

  /**
   * Score providers based on multiple factors and sort by priority
   */
  private scoreProviders(providers: User[], criteria: MatchingCriteria): MatchScore[] {
    return providers.map(provider => {
      const distance = this.calculateDistance(
        criteria.latitude,
        criteria.longitude,
        provider.latitude || 0,
        provider.longitude || 0
      );

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
  private calculateProviderScore(params: {
    distance: number;
    rating: number;
    completionRate: number;
    responseTime: number;
    totalJobsCompleted: number;
    urgency: string;
  }): number {
    const {
      distance,
      rating,
      completionRate,
      responseTime,
      totalJobsCompleted,
      urgency
    } = params;

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
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate provider completion rate
   */
  private calculateCompletionRate(provider: User): number {
    const total = provider.total_jobs_completed + provider.total_jobs_declined;
    if (total === 0) return 50; // Default for new providers
    return (provider.total_jobs_completed / total) * 100;
  }

  /**
   * Save eligible providers to database with matching metadata
   * NEW: Stores ALL eligible providers (not just top 5 notified)
   */
  private async saveEligibleProviders(
    scoredProviders: MatchScore[], 
    requestId: number
  ): Promise<void> {
    const records = scoredProviders.map((match, index) => ({
      request_id: requestId,
      provider_id: match.provider.id,
      match_score: Math.round(match.score * 100) / 100, // Round to 2 decimals
      distance_miles: match.distance ? Math.round(match.distance * 100) / 100 : undefined,
      rank: index + 1, // 1-based ranking
      status: 'eligible' as const, // Initial status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Batch insert all eligible providers
    await RequestEligibleProvider.query().insert(records);
  }

  /**
   * Send notifications to selected providers
   */
  private async notifyProviders(scoredProviders: MatchScore[], request: ServiceRequest): Promise<void> {
    const responseWindow = this.getResponseWindow(request.urgency);
    const expiresAt = new Date(Date.now() + responseWindow * 60 * 1000);

    for (const { provider, distance } of scoredProviders) {
      await notificationService.createNotification({
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
          expiresAt: expiresAt.toISOString()
        }
      });
      
      // UPDATE: Mark provider as notified in eligible providers table
      await RequestEligibleProvider.query()
        .patch({
          status: 'notified',
          notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where({ request_id: request.id, provider_id: provider.id });
    }
  }

  /**
   * Get response window in minutes based on urgency
   */
  private getResponseWindow(urgency: string): number {
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
  private getTierNameFromId(tierId: number): 'basic' | 'expert' | 'premium' {
    const tierIndex = (tierId - 1) % 3;
    const tierNames: ('basic' | 'expert' | 'premium')[] = ['basic', 'expert', 'premium'];
    return tierNames[tierIndex];
  }

  /**
   * Re-match request if all notified providers declined or timed out
   */
  async rematchRequest(requestId: number): Promise<void> {
    const request = await ServiceRequest.query()
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
    await this.matchProvidersToRequest(request);
  }
}

export const matchingService = new MatchingService();


