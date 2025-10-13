"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const User_1 = __importDefault(require("./User"));
const ServiceCategory_1 = __importDefault(require("./ServiceCategory"));
const ServiceTier_1 = __importDefault(require("./ServiceTier"));
class ServiceRequest extends objection_1.Model {
    static get tableName() {
        return 'service_requests';
    }
    static get relationMappings() {
        return {
            user: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'service_requests.user_id',
                    to: 'users.id'
                }
            },
            category: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceCategory_1.default,
                join: {
                    from: 'service_requests.category_id',
                    to: 'service_categories.id'
                }
            },
            tier: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceTier_1.default,
                join: {
                    from: 'service_requests.tier_id',
                    to: 'service_tiers.id'
                }
            },
            assignedProvider: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'service_requests.assigned_provider_id',
                    to: 'users.id'
                }
            }
        };
    }
}
exports.default = ServiceRequest;
