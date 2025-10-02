import { Model } from 'objection';
import User from './User';

export default class Notification extends Model {
  id!: number;
  user_id!: number;
  
  type!: string;
  title!: string;
  message!: string;
  data?: any; // JSON object
  
  is_read!: boolean;
  read_at?: string;
  is_push_sent!: boolean;
  is_email_sent!: boolean;
  
  created_at!: string;
  updated_at!: string;

  // Relations
  user?: User;

  static get tableName() {
    return 'notifications';
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'notifications.user_id',
          to: 'users.id'
        }
      }
    };
  }
}
