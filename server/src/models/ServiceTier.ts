import { Model } from 'objection';
import ServiceCategory from './ServiceCategory';

export default class ServiceTier extends Model {
  id!: number;
  name!: string;
  description?: string;
  base_hourly_rate!: number;
  category_id!: number;
  is_active!: boolean;
  created_at!: string;
  updated_at!: string;

  // Relations
  category?: ServiceCategory;

  static get tableName() {
    return 'service_tiers';
  }

  static get relationMappings() {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ServiceCategory,
        join: {
          from: 'service_tiers.category_id',
          to: 'service_categories.id'
        }
      }
    };
  }
}
