import { Model } from 'objection';
import User from './User';
import ServiceCategory from './ServiceCategory';
import ServiceTier from './ServiceTier';
import RequestEligibleProvider from './RequestEligibleProvider';

export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';
export type CancelledBy = 'customer' | 'provider' | 'admin';
export type CancellationStage = 'pending' | 'assigned' | 'in_progress';

export default class ServiceRequest extends Model {
  id!: number;
  user_id!: number;
  category_id!: number;
  tier_id!: number;
  
  title!: string;
  description!: string;
  address!: string;
  latitude!: number;
  longitude!: number;
  
  preferred_date?: string;
  urgency!: UrgencyLevel;
  estimated_hours?: number;
  images?: string[]; // JSON array
  
  status!: RequestStatus;
  assigned_provider_id?: number;
  assigned_at?: string;
  
  // Provider response tracking
  provider_accepted_at?: string;
  provider_declined_at?: string;
  decline_reason?: string;
  
  // Job lifecycle timestamps
  expires_at?: string;
  started_at?: string;
  completed_at?: string;
  
  // Cancellation tracking (NEW)
  cancelled_at?: string;
  cancelled_by?: CancelledBy;
  cancellation_reason?: string;
  cancellation_stage?: CancellationStage;
  
  created_at!: string;
  updated_at!: string;

  // Relations
  user?: User;
  category?: ServiceCategory;
  tier?: ServiceTier;
  assignedProvider?: User;
  eligibleProviders?: RequestEligibleProvider[];

  static get tableName() {
    return 'service_requests';
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'service_requests.user_id',
          to: 'users.id'
        }
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceCategory,
        join: {
          from: 'service_requests.category_id',
          to: 'service_categories.id'
        }
      },
      tier: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceTier,
        join: {
          from: 'service_requests.tier_id',
          to: 'service_tiers.id'
        }
      },
      assignedProvider: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'service_requests.assigned_provider_id',
          to: 'users.id'
        }
      },
      eligibleProviders: {
        relation: Model.HasManyRelation,
        modelClass: RequestEligibleProvider,
        join: {
          from: 'service_requests.id',
          to: 'request_eligible_providers.request_id'
        }
      }
    };
  }
}
