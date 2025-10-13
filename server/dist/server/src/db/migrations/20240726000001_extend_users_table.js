"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.table('users', (table) => {
            // User profile extensions
            table.string('first_name').nullable();
            table.string('last_name').nullable();
            table.string('phone').nullable();
            table.text('address').nullable();
            table.decimal('latitude', 10, 8).nullable();
            table.decimal('longitude', 11, 8).nullable();
            table.string('profile_image').nullable();
            // Role management
            table.boolean('is_service_provider').defaultTo(false);
            table.boolean('is_admin').defaultTo(false);
            table.enum('provider_status', ['pending', 'approved', 'rejected', 'suspended']).nullable();
            table.timestamp('provider_approved_at').nullable();
            table.integer('approved_by').unsigned().nullable();
            table.foreign('approved_by').references('users.id');
            // Provider specific fields
            table.text('provider_bio').nullable();
            table.json('provider_skills').nullable(); // Array of skill/experience descriptions
            table.json('provider_certifications').nullable(); // Array of certification objects
            table.decimal('average_rating', 3, 2).nullable();
            table.integer('total_jobs_completed').defaultTo(0);
            table.integer('total_jobs_declined').defaultTo(0);
            table.integer('response_time_average').nullable();
            table.boolean('is_available').defaultTo(true);
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.table('users', (table) => {
            table.dropColumn('first_name');
            table.dropColumn('last_name');
            table.dropColumn('phone');
            table.dropColumn('address');
            table.dropColumn('latitude');
            table.dropColumn('longitude');
            table.dropColumn('profile_image');
            table.dropColumn('is_service_provider');
            table.dropColumn('is_admin');
            table.dropColumn('provider_status');
            table.dropColumn('provider_approved_at');
            table.dropForeign(['approved_by']);
            table.dropColumn('approved_by');
            table.dropColumn('provider_bio');
            table.dropColumn('provider_skills');
            table.dropColumn('provider_certifications');
            table.dropColumn('average_rating');
            table.dropColumn('total_jobs_completed');
            table.dropColumn('total_jobs_declined');
            table.dropColumn('response_time_average');
            table.dropColumn('is_available');
        });
    });
}
