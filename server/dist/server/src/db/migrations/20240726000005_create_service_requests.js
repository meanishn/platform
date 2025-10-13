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
        return knex.schema.createTable('service_requests', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.integer('category_id').unsigned().notNullable();
            table.integer('tier_id').unsigned().notNullable();
            table.string('title').notNullable();
            table.text('description').notNullable();
            table.text('address').notNullable();
            table.decimal('latitude', 10, 8).notNullable();
            table.decimal('longitude', 11, 8).notNullable();
            table.timestamp('preferred_date').nullable();
            table.enum('urgency', ['low', 'medium', 'high', 'emergency']).defaultTo('medium');
            table.decimal('estimated_hours', 5, 2).nullable();
            table.json('images').nullable(); // Array of image URLs
            table.enum('status', [
                'pending', // Just created, waiting for provider assignment
                'assigned', // Provider accepted
                'in_progress', // Work started
                'completed', // Work completed
                'cancelled' // Cancelled by user or provider
            ]).defaultTo('pending');
            table.integer('assigned_provider_id').unsigned().nullable();
            table.timestamp('assigned_at').nullable();
            table.timestamp('provider_accepted_at').nullable();
            table.timestamp('provider_declined_at').nullable();
            table.text('decline_reason').nullable();
            table.timestamp('expires_at').nullable(); // When request expires if no providers accept
            table.timestamp('started_at').nullable();
            table.timestamp('completed_at').nullable();
            table.timestamps(true, true);
            table.foreign('user_id').references('users.id').onDelete('CASCADE');
            table.foreign('category_id').references('service_categories.id');
            table.foreign('tier_id').references('service_tiers.id');
            table.foreign('assigned_provider_id').references('users.id');
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('service_requests');
    });
}
