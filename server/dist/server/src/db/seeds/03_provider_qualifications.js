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
exports.seed = seed;
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Clear existing provider categories
        yield knex('provider_categories').del();
        // Get user IDs
        const johnSmith = yield knex('users').where('email', 'john.smith@email.com').first();
        const mariaGarcia = yield knex('users').where('email', 'maria.garcia@email.com').first();
        const admin = yield knex('users').where('email', 'admin@platform.com').first();
        if (!johnSmith || !mariaGarcia || !admin) {
            console.warn('Users not found, skipping provider qualifications seed');
            return;
        }
        // Get category IDs
        const electricalCategory = yield knex('service_categories').where('name', 'Electrical').first();
        const plumbingCategory = yield knex('service_categories').where('name', 'Plumbing').first();
        if (!electricalCategory || !plumbingCategory) {
            console.warn('Service categories not found, skipping provider qualifications seed');
            return;
        }
        // John Smith (Electrician) - Qualified for Electrical services (Basic, Expert, Premium)
        yield knex('provider_categories').insert([
            {
                provider_id: johnSmith.id,
                category_id: electricalCategory.id,
                qualified_tiers: JSON.stringify(['basic', 'expert', 'premium']),
                is_verified: true,
                verified_at: new Date().toISOString(),
                verified_by: admin.id
            }
        ]);
        // Maria Garcia (Plumber) - Qualified for Plumbing services (Basic, Expert, Premium)
        yield knex('provider_categories').insert([
            {
                provider_id: mariaGarcia.id,
                category_id: plumbingCategory.id,
                qualified_tiers: JSON.stringify(['basic', 'expert', 'premium']),
                is_verified: true,
                verified_at: new Date().toISOString(),
                verified_by: admin.id
            }
        ]);
        console.log('✅ Provider qualifications seeded successfully');
    });
}
