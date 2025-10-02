import { Model } from 'objection';
import ServiceRequest from './ServiceRequest';
import User from './User';

export default class RequestAcceptance extends Model {
  id!: number;
  request_id!: number;
  provider_id!: number;
  accepted_at!: string;

  request?: ServiceRequest;
  provider?: User;

  static get tableName() {
    return 'request_acceptances';
  }

  static get relationMappings() {
    return {
      request: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceRequest,
        join: {
          from: 'request_acceptances.request_id',
          to: 'service_requests.id'
        }
      },
      provider: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'request_acceptances.provider_id',
          to: 'users.id'
        }
      }
    };
  }
}


