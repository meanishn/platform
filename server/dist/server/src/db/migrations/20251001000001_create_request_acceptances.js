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
        return knex.schema.createTable('request_acceptances', (table) => {
            table.increments('id').primary();
            table.integer('request_id').unsigned().notNullable();
            table.integer('provider_id').unsigned().notNullable();
            table.timestamp('accepted_at').notNullable().defaultTo(knex.fn.now());
            table.unique(['request_id', 'provider_id']);
            table
                .foreign('request_id')
                .references('service_requests.id')
                .onDelete('CASCADE');
            table
                .foreign('provider_id')
                .references('users.id')
                .onDelete('CASCADE');
            table.timestamps(true, true);
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable('request_acceptances');
    });
}
