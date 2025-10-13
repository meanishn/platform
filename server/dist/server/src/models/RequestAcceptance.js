"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const ServiceRequest_1 = __importDefault(require("./ServiceRequest"));
const User_1 = __importDefault(require("./User"));
class RequestAcceptance extends objection_1.Model {
    static get tableName() {
        return 'request_acceptances';
    }
    static get relationMappings() {
        return {
            request: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceRequest_1.default,
                join: {
                    from: 'request_acceptances.request_id',
                    to: 'service_requests.id'
                }
            },
            provider: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'request_acceptances.provider_id',
                    to: 'users.id'
                }
            }
        };
    }
}
exports.default = RequestAcceptance;
