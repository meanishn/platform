import { Model } from 'objection';
import ServiceTier from './ServiceTier';
import ProviderCategory from './ProviderCategory';

export default class ServiceCategory extends Model {
  id!: number;
  name!: string;
  description?: string;
  icon?: string;
  is_active!: boolean;
  created_at!: string;
  updated_at!: string;

  // Relations
  tiers?: ServiceTier[];
  providerCategories?: ProviderCategory[];

  static get tableName() {
    return 'service_categories';
  }

  static get relationMappings() {
    return {
      tiers: {
        relation: Model.HasManyRelation,
        modelClass: ServiceTier,
        join: {
          from: 'service_categories.id',
          to: 'service_tiers.category_id'
        }
      },
      providerCategories: {
        relation: Model.HasManyRelation,
        modelClass: ProviderCategory,
        join: {
          from: 'service_categories.id',
          to: 'provider_categories.category_id'
        }
      }
    };
  }
}
