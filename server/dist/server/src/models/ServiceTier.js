"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const ServiceCategory_1 = __importDefault(require("./ServiceCategory"));
class ServiceTier extends objection_1.Model {
    static get tableName() {
        return 'service_tiers';
    }
    static get relationMappings() {
        return {
            category: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceCategory_1.default,
                join: {
                    from: 'service_tiers.category_id',
                    to: 'service_categories.id'
                }
            }
        };
    }
}
exports.default = ServiceTier;
