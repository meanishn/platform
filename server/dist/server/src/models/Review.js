"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const ServiceRequest_1 = __importDefault(require("./ServiceRequest"));
const User_1 = __importDefault(require("./User"));
class Review extends objection_1.Model {
    static get tableName() {
        return 'reviews';
    }
    static get relationMappings() {
        return {
            request: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: ServiceRequest_1.default,
                join: {
                    from: 'reviews.request_id',
                    to: 'service_requests.id'
                }
            },
            reviewer: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'reviews.reviewer_id',
                    to: 'users.id'
                }
            },
            reviewee: {
                relation: objection_1.Model.BelongsToOneRelation,
                modelClass: User_1.default,
                join: {
                    from: 'reviews.reviewee_id',
                    to: 'users.id'
                }
            }
        };
    }
}
exports.default = Review;
