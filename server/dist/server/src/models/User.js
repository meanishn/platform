"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const ServiceRequest_1 = __importDefault(require("./ServiceRequest"));
const ProviderCategory_1 = __importDefault(require("./ProviderCategory"));
const Review_1 = __importDefault(require("./Review"));
const Notification_1 = __importDefault(require("./Notification"));
class User extends objection_1.Model {
    static get tableName() {
        return 'users';
    }
    static get relationMappings() {
        return {
            serviceRequests: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: ServiceRequest_1.default,
                join: {
                    from: 'users.id',
                    to: 'service_requests.user_id'
                }
            },
            assignedRequests: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: ServiceRequest_1.default,
                join: {
                    from: 'users.id',
                    to: 'service_requests.assigned_provider_id'
                }
            },
            providerCategories: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: ProviderCategory_1.default,
                join: {
                    from: 'users.id',
                    to: 'provider_categories.provider_id'
                }
            },
            givenReviews: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Review_1.default,
                join: {
                    from: 'users.id',
                    to: 'reviews.reviewer_id'
                }
            },
            receivedReviews: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Review_1.default,
                join: {
                    from: 'users.id',
                    to: 'reviews.reviewee_id'
                }
            },
            notifications: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: Notification_1.default,
                join: {
                    from: 'users.id',
                    to: 'notifications.user_id'
                }
            },
            approver: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'users.approved_by',
                    to: 'users.id'
                }
            },
            approvedProviders: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: User,
                join: {
                    from: 'users.id',
                    to: 'users.approved_by'
                }
            }
        };
    }
    // Helper methods
    get fullName() {
        return `${this.first_name || ''} ${this.last_name || ''}`.trim();
    }
    get isApprovedProvider() {
        return this.is_service_provider && this.provider_status === 'approved';
    }
    get role() {
        if (this.is_admin)
            return 'admin';
        if (this.is_service_provider)
            return 'provider';
        return 'customer';
    }
}
exports.default = User;
