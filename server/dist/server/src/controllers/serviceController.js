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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const ServiceCategory_1 = __importDefault(require("../models/ServiceCategory"));
const ServiceTier_1 = __importDefault(require("../models/ServiceTier"));
class ServiceController {
    constructor() {
        /**
         * Get all service categories
         */
        this.getCategories = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield ServiceCategory_1.default.query()
                    .where('is_active', true)
                    .withGraphFetched('tiers')
                    .orderBy('name');
                res.json({
                    success: true,
                    data: categories
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get categories'
                });
            }
        });
        /**
         * Get service tiers for a category
         */
        this.getCategoryTiers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId } = req.params;
                const tiers = yield ServiceTier_1.default.query()
                    .where('category_id', categoryId)
                    .where('is_active', true)
                    .orderBy('base_hourly_rate');
                res.json({
                    success: true,
                    data: tiers
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get tiers'
                });
            }
        });
        /**
         * Create service category (admin only)
         */
        this.createCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { name, description, icon } = req.body;
                const category = yield ServiceCategory_1.default.query().insertAndFetch({
                    name,
                    description,
                    icon,
                    is_active: true
                });
                res.status(201).json({
                    success: true,
                    message: 'Category created successfully',
                    data: category
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Category creation failed'
                });
            }
        });
        /**
         * Create service tier (admin only)
         */
        this.createTier = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { name, description, baseHourlyRate, categoryId } = req.body;
                const tier = yield ServiceTier_1.default.query().insertAndFetch({
                    name,
                    description,
                    base_hourly_rate: baseHourlyRate,
                    category_id: categoryId,
                    is_active: true
                });
                res.status(201).json({
                    success: true,
                    message: 'Tier created successfully',
                    data: tier
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Tier creation failed'
                });
            }
        });
        /**
         * Update category (admin only)
         */
        this.updateCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { categoryId } = req.params;
                const { name, description, icon, isActive } = req.body;
                const category = yield ServiceCategory_1.default.query().patchAndFetchById(categoryId, {
                    name,
                    description,
                    icon,
                    is_active: isActive
                });
                res.json({
                    success: true,
                    message: 'Category updated successfully',
                    data: category
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Category update failed'
                });
            }
        });
        /**
         * Update tier (admin only)
         */
        this.updateTier = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { tierId } = req.params;
                const { name, description, baseHourlyRate, isActive } = req.body;
                const tier = yield ServiceTier_1.default.query().patchAndFetchById(tierId, {
                    name,
                    description,
                    base_hourly_rate: baseHourlyRate,
                    is_active: isActive
                });
                res.json({
                    success: true,
                    message: 'Tier updated successfully',
                    data: tier
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Tier update failed'
                });
            }
        });
    }
}
exports.ServiceController = ServiceController;
