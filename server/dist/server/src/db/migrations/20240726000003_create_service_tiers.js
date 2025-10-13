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
        return knex.schema.createTable('service_tiers', (table) => {
            table.increments('id').primary();
            table.integer('category_id').unsigned().notNullable();
            table.string('name').notNullable(); // 'Basic', 'Expert', 'Premium'
            table.string('description').nullable();
            table.decimal('base_hourly_rate', 10, 2).notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
            table.foreign('category_id').references('service_categories.id').onDelete('CASCADE');
            table.unique(['category_id', 'name']); // One tier name per category
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('service_tiers');
    });
}
