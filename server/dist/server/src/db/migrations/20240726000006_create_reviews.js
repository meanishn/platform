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
        return knex.schema.createTable('reviews', (table) => {
            table.increments('id').primary();
            table.integer('request_id').unsigned().notNullable();
            table.integer('reviewer_id').unsigned().notNullable();
            table.integer('reviewee_id').unsigned().notNullable();
            table.integer('rating').notNullable(); // 1-5
            table.text('comment').nullable();
            table.json('criteria_ratings').nullable(); // { quality, timeliness, communication, professionalism, value }
            table.boolean('is_public').defaultTo(true);
            table.timestamps(true, true);
            table.foreign('request_id').references('service_requests.id').onDelete('CASCADE');
            table.foreign('reviewer_id').references('users.id').onDelete('CASCADE');
            table.foreign('reviewee_id').references('users.id').onDelete('CASCADE');
            table.unique(['request_id']); // One review per request
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('reviews');
    });
}
