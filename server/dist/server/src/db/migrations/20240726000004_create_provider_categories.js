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
        return knex.schema.createTable('provider_categories', (table) => {
            table.increments('id').primary();
            table.integer('provider_id').unsigned().notNullable();
            table.integer('category_id').unsigned().notNullable();
            table.json('qualified_tiers').nullable(); // Array of tier names: ['basic', 'expert', 'premium']
            table.boolean('is_verified').defaultTo(false);
            table.timestamp('verified_at').nullable();
            table.integer('verified_by').unsigned().nullable();
            table.timestamps(true, true);
            table.foreign('provider_id').references('users.id').onDelete('CASCADE');
            table.foreign('category_id').references('service_categories.id').onDelete('CASCADE');
            table.foreign('verified_by').references('users.id');
            table.unique(['provider_id', 'category_id']); // One entry per provider per category
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('provider_categories');
    });
}
