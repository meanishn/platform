"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const ServiceTier_1 = __importDefault(require("./ServiceTier"));
const ProviderCategory_1 = __importDefault(require("./ProviderCategory"));
class ServiceCategory extends objection_1.Model {
    static get tableName() {
        return 'service_categories';
    }
    static get relationMappings() {
        return {
            tiers: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: ServiceTier_1.default,
                join: {
                    from: 'service_categories.id',
                    to: 'service_tiers.category_id'
                }
            },
            providerCategories: {
                relation: objection_1.Model.HasManyRelation,
                modelClass: ProviderCategory_1.default,
                join: {
                    from: 'service_categories.id',
                    to: 'provider_categories.category_id'
                }
            }
        };
    }
}
exports.default = ServiceCategory;
