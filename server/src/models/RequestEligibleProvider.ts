import { Model } from 'objection';
import ServiceRequest from './ServiceRequest';
import User from './User';

/**
 * Provider Status Enum
 * 
 * Hybrid state management: status provides fast filtering, timestamps are source of truth
 */
export type ProviderEligibilityStatus =
  // Normal flow
  | 'eligible'                  // Matched by algorithm, can be notified
  | 'notified'                  // Notification sent to provider
  | 'accepted'                  // Provider accepted, waiting for customer selection
  | 'selected'                  // Customer chose this provider (winner)
  | 'rejected'                  // Another provider was selected
  // Cancellation states
  | 'cancelled_unassigned'      // Job cancelled before provider selection
  | 'cancelled_assigned'        // Job cancelled after assignment (by customer)
  | 'cancelled_by_provider'     // Provider cancelled after selection
  | 'cancelled_in_progress';    // Provider cancelled during work

/**
 * RequestEligibleProvider Model
 * 
 * Junction table tracking which providers are eligible for which service requests
 * Stores matching metadata (scores, distances, rankings) and state transitions
 * 
 * Replaces notification-based eligibility tracking with proper relational design
 */
export default class RequestEligibleProvider extends Model {
  id!: number;
  request_id!: number;
  provider_id!: number;
  
  // Matching metadata from algorithm
  match_score!: number;        // 0-100 score from matching algorithm
  distance_miles?: number;     // Distance in miles from provider to job
  rank!: number;               // 1=best match, 2=second best, etc.
  
  // STATE MANAGEMENT: HYBRID APPROACH
  status!: ProviderEligibilityStatus;
  
  // TIMESTAMPS: Source of truth
  notified_at?: string;        // When provider was notified
  accepted_at?: string;        // When provider accepted
  selected_at?: string;        // When customer selected this provider
  cancelled_at?: string;       // When cancellation occurred
  
  // Audit timestamps
  created_at!: string;
  updated_at!: string;

  // Relations
  request?: ServiceRequest;
  provider?: User;

  static get tableName() {
    return 'request_eligible_providers';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['request_id', 'provider_id', 'match_score', 'rank', 'status'],

      properties: {
        id: { type: 'integer' },
        request_id: { type: 'integer' },
        provider_id: { type: 'integer' },
        match_score: { type: 'number', minimum: 0, maximum: 100 },
        distance_miles: { type: ['number', 'null'], minimum: 0 },
        rank: { type: 'integer', minimum: 1 },
        status: {
          type: 'string',
          enum: [
            'eligible',
            'notified',
            'accepted',
            'selected',
            'rejected',
            'cancelled_unassigned',
            'cancelled_assigned',
            'cancelled_by_provider',
            'cancelled_in_progress'
          ]
        },
        notified_at: { type: ['string', 'null'], format: 'date-time' },
        accepted_at: { type: ['string', 'null'], format: 'date-time' },
        selected_at: { type: ['string', 'null'], format: 'date-time' },
        cancelled_at: { type: ['string', 'null'], format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      request: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceRequest,
        join: {
          from: 'request_eligible_providers.request_id',
          to: 'service_requests.id'
        }
      },
      provider: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'request_eligible_providers.provider_id',
          to: 'users.id'
        }
      }
    };
  }

  /**
   * Computed property: Is provider in a state where they can accept?
   */
  get canAccept(): boolean {
    return this.status === 'eligible' || this.status === 'notified';
  }

  /**
   * Computed property: Has provider been notified?
   */
  get wasNotified(): boolean {
    return this.notified_at !== undefined && this.notified_at !== null;
  }

  /**
   * Computed property: Is this a cancellation state?
   */
  get isCancelled(): boolean {
    return this.status.startsWith('cancelled');
  }

  /**
   * Get human-readable status description
   */
  getStatusDescription(): string {
    switch (this.status) {
      case 'eligible':
        return 'Eligible to be notified';
      case 'notified':
        return 'Notified, can accept';
      case 'accepted':
        return 'Accepted, waiting for customer';
      case 'selected':
        return 'Selected by customer';
      case 'rejected':
        return 'Customer selected another provider';
      case 'cancelled_unassigned':
        return 'Job cancelled before selection';
      case 'cancelled_assigned':
        return 'Job cancelled after assignment';
      case 'cancelled_by_provider':
        return 'Provider cancelled';
      case 'cancelled_in_progress':
        return 'Cancelled during work';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Lifecycle hook: Update timestamps on save
   */
  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}
