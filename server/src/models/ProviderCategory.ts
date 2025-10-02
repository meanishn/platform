import { Model } from 'objection';
import User from './User';
import ServiceCategory from './ServiceCategory';

export type TierLevel = 'basic' | 'expert' | 'premium';

export default class ProviderCategory extends Model {
  id!: number;
  provider_id!: number;
  category_id!: number;
  qualified_tiers?: TierLevel[]; // Array of tier names provider is qualified for
  is_verified!: boolean;
  verified_at?: string;
  verified_by?: number;
  created_at!: string;
  updated_at!: string;

  // Relations
  provider?: User;
  category?: ServiceCategory;
  verifier?: User;

  static get tableName() {
    return 'provider_categories';
  }

  static get relationMappings() {
    return {
      provider: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'provider_categories.provider_id',
          to: 'users.id'
        }
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceCategory,
        join: {
          from: 'provider_categories.category_id',
          to: 'service_categories.id'
        }
      },
      verifier: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'provider_categories.verified_by',
          to: 'users.id'
        }
      }
    };
  }
}
