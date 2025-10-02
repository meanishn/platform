import { Model } from 'objection';
import ServiceRequest from './ServiceRequest';
import ProviderCategory from './ProviderCategory';
import Review from './Review';
import Notification from './Notification';

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export default class User extends Model {
  id!: number;
  email!: string;
  password?: string;
  googleId?: string;
  
  // Profile fields
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  profile_image?: string;
  
  // Role management
  is_service_provider!: boolean;
  is_admin!: boolean;
  provider_status?: ProviderStatus;
  provider_approved_at?: string;
  approved_by?: number;
  
  // Provider specific
  provider_bio?: string;
  provider_skills?: string[]; // JSON array
  provider_certifications?: any[]; // JSON array
  average_rating?: number;
  total_jobs_completed!: number;
  total_jobs_declined!: number;
  response_time_average?: number; // in minutes
  is_available!: boolean;
  
  created_at!: string;
  updated_at!: string;

  // Relations
  serviceRequests?: ServiceRequest[];
  assignedRequests?: ServiceRequest[]; // Requests assigned to this provider
  providerCategories?: ProviderCategory[];
  givenReviews?: Review[];
  receivedReviews?: Review[];
  notifications?: Notification[];
  approver?: User;
  approvedProviders?: User[];

  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    return {
      serviceRequests: {
        relation: Model.HasManyRelation,
        modelClass: ServiceRequest,
        join: {
          from: 'users.id',
          to: 'service_requests.user_id'
        }
      },
      assignedRequests: {
        relation: Model.HasManyRelation,
        modelClass: ServiceRequest,
        join: {
          from: 'users.id',
          to: 'service_requests.assigned_provider_id'
        }
      },
      providerCategories: {
        relation: Model.HasManyRelation,
        modelClass: ProviderCategory,
        join: {
          from: 'users.id',
          to: 'provider_categories.provider_id'
        }
      },
      givenReviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'users.id',
          to: 'reviews.reviewer_id'
        }
      },
      receivedReviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'users.id',
          to: 'reviews.reviewee_id'
        }
      },
      notifications: {
        relation: Model.HasManyRelation,
        modelClass: Notification,
        join: {
          from: 'users.id',
          to: 'notifications.user_id'
        }
      },
      approver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users.approved_by',
          to: 'users.id'
        }
      },
      approvedProviders: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'users.id',
          to: 'users.approved_by'
        }
      }
    };
  }

  // Helper methods
  get fullName(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim();
  }

  get isApprovedProvider(): boolean {
    return this.is_service_provider && this.provider_status === 'approved';
  }

  get role(): 'customer' | 'provider' | 'admin' {
    if (this.is_admin) return 'admin';
    if (this.is_service_provider) return 'provider';
    return 'customer';
  }
}