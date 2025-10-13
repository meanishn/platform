"use strict";
/**
 * Dashboard Controller
 *
 * Handles HTTP requests for dashboard statistics and activity feeds
 */
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
exports.dashboardController = exports.DashboardController = void 0;
const dashboardService_1 = require("../services/dashboardService");
class DashboardController {
    constructor() {
        /**
         * Get customer dashboard statistics
         * GET /api/customers/dashboard/stats
         */
        this.getCustomerStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const stats = yield dashboardService_1.dashboardService.getCustomerStats(userId);
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get stats'
                });
            }
        });
        /**
         * Get customer activity feed
         * GET /api/customers/dashboard/activity
         */
        this.getCustomerActivity = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { limit } = req.query;
                const activity = yield dashboardService_1.dashboardService.getCustomerActivity(userId, limit ? parseInt(limit) : undefined);
                res.json({
                    success: true,
                    data: activity
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get activity'
                });
            }
        });
        /**
         * Get provider dashboard statistics
         * GET /api/providers/dashboard/stats
         */
        this.getProviderStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const stats = yield dashboardService_1.dashboardService.getProviderStats(providerId);
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get stats'
                });
            }
        });
        /**
         * Get provider activity feed
         * GET /api/providers/dashboard/requests
         */
        this.getProviderActivity = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { limit } = req.query;
                const activity = yield dashboardService_1.dashboardService.getProviderActivity(providerId, limit ? parseInt(limit) : undefined);
                res.json({
                    success: true,
                    data: activity
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get activity'
                });
            }
        });
        /**
         * Get admin dashboard statistics
         * GET /api/admin/dashboard/stats
         */
        this.getAdminStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const stats = yield dashboardService_1.dashboardService.getAdminStats();
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get stats'
                });
            }
        });
        /**
         * Get admin activity feed
         * GET /api/admin/dashboard/activity
         */
        this.getAdminActivity = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { limit } = req.query;
                const activity = yield dashboardService_1.dashboardService.getAdminActivity(limit ? parseInt(limit) : undefined);
                res.json({
                    success: true,
                    data: activity
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get activity'
                });
            }
        });
        /**
         * Get dashboard stats based on user role (generic endpoint)
         * GET /api/dashboard/stats
         */
        this.getDashboardStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                let stats;
                if (user.is_admin) {
                    stats = yield dashboardService_1.dashboardService.getAdminStats();
                }
                else if (user.isApprovedProvider) {
                    stats = yield dashboardService_1.dashboardService.getProviderStats(user.id);
                }
                else {
                    stats = yield dashboardService_1.dashboardService.getCustomerStats(user.id);
                }
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get stats'
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
