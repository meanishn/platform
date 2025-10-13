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
        // Clear existing data
        yield knex('service_tiers').del();
        yield knex('service_categories').del();
        // Insert service categories
        const categories = yield knex('service_categories').insert([
            {
                name: 'Plumbing',
                description: 'Professional plumbing services including repairs, installations, and maintenance',
                icon: 'plumbing',
                is_active: true
            },
            {
                name: 'Electrical',
                description: 'Licensed electrical work including wiring, installations, and troubleshooting',
                icon: 'electrical',
                is_active: true
            },
            {
                name: 'Painting',
                description: 'Interior and exterior painting services for residential and commercial properties',
                icon: 'painting',
                is_active: true
            },
            {
                name: 'Housekeeping',
                description: 'Professional cleaning services for homes and offices',
                icon: 'cleaning',
                is_active: true
            },
            {
                name: 'Solar Installation',
                description: 'Solar panel installation and maintenance services',
                icon: 'solar',
                is_active: true
            },
            {
                name: 'HVAC',
                description: 'Heating, ventilation, and air conditioning services',
                icon: 'hvac',
                is_active: true
            },
            {
                name: 'Landscaping',
                description: 'Garden design, maintenance, and landscaping services',
                icon: 'landscaping',
                is_active: true
            },
            {
                name: 'Carpentry',
                description: 'Custom woodwork, furniture repair, and carpentry services',
                icon: 'carpentry',
                is_active: true
            }
        ]).returning('id');
        // Insert service tiers for each category
        const tierData = [];
        for (const category of categories) {
            const categoryId = category.id || category;
            // Basic tier
            tierData.push({
                name: 'Basic',
                description: 'Standard service with basic tools and materials',
                base_hourly_rate: 35.00,
                category_id: categoryId,
                is_active: true
            });
            // Expert tier  
            tierData.push({
                name: 'Expert',
                description: 'Professional service with premium tools and experience',
                base_hourly_rate: 55.00,
                category_id: categoryId,
                is_active: true
            });
            // Premium tier
            tierData.push({
                name: 'Premium',
                description: 'Top-tier service with specialized equipment and expert technicians',
                base_hourly_rate: 85.00,
                category_id: categoryId,
                is_active: true
            });
        }
        yield knex('service_tiers').insert(tierData);
    });
}
