"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const User_1 = __importDefault(require("./User"));
const ServiceCategory_1 = __importDefault(require("./ServiceCategory"));
class ProviderCategory extends objection_1.Model {
    static get tableName() {
        return 'provider_categories';
    }
    static get relationMappings() {
        return {
            provider: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'provider_categories.provider_id',
                    to: 'users.id'
                }
            },
            category: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceCategory_1.default,
                join: {
                    from: 'provider_categories.category_id',
                    to: 'service_categories.id'
                }
            },
            verifier: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'provider_categories.verified_by',
                    to: 'users.id'
                }
            }
        };
    }
}
exports.default = ProviderCategory;
