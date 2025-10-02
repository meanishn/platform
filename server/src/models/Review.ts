import { Model } from 'objection';
import ServiceRequest from './ServiceRequest';
import User from './User';

export default class Review extends Model {
  id!: number;
  request_id!: number;
  reviewer_id!: number;
  reviewee_id!: number;
  
  rating!: number; // 1-5
  comment?: string;
  criteria_ratings?: any; // JSON object
  
  is_public!: boolean;
  
  created_at!: string;
  updated_at!: string;

  // Relations
  request?: ServiceRequest;
  reviewer?: User;
  reviewee?: User;

  static get tableName() {
    return 'reviews';
  }

  static get relationMappings() {
    return {
      request: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceRequest,
        join: {
          from: 'reviews.request_id',
          to: 'service_requests.id'
        }
      },
      reviewer: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews.reviewer_id',
          to: 'users.id'
        }
      },
      reviewee: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews.reviewee_id',
          to: 'users.id'
        }
      }
    };
  }
}
