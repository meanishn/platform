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
        return knex.schema.createTable('notifications', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.string('type').notNullable(); // 'new_assignment', 'job_completed', etc.
            table.string('title').notNullable();
            table.text('message').notNullable();
            table.json('data').nullable(); // Additional metadata
            table.boolean('is_read').defaultTo(false);
            table.timestamp('read_at').nullable();
            table.boolean('is_push_sent').defaultTo(false);
            table.boolean('is_email_sent').defaultTo(false);
            table.timestamps(true, true);
            table.foreign('user_id').references('users.id').onDelete('CASCADE');
            table.index(['user_id', 'is_read']); // For efficient querying
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('notifications');
    });
}
