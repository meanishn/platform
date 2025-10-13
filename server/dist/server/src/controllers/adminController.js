"use strict";
/**
 * Admin Controller
 *
 * Handles HTTP requests for administrative functions
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
exports.adminController = exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const express_validator_1 = require("express-validator");
class AdminController {
    constructor() {
        /**
         * Get list of users
         * GET /api/admin/users
         */
        this.getUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { role, status, searchQuery, limit, offset } = req.query;
                const result = yield adminService_1.adminService.getUsers({
                    role: role,
                    status: status,
                    searchQuery: searchQuery,
                    limit: limit ? parseInt(limit) : undefined,
                    offset: offset ? parseInt(offset) : undefined
                });
                res.json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get users'
                });
            }
        });
        /**
         * Get provider details
         * GET /api/admin/providers/:id
         */
        this.getProviderDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const provider = yield adminService_1.adminService.getProviderDetails(parseInt(id));
                if (!provider) {
                    return res.status(404).json({ success: false, message: 'Provider not found' });
                }
                res.json({
                    success: true,
                    data: provider
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get provider'
                });
            }
        });
        /**
         * Get pending provider applications
         * GET /api/admin/providers/pending
         */
        this.getPendingProviders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const providers = yield adminService_1.adminService.getPendingProviders();
                res.json({
                    success: true,
                    data: providers
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get pending providers'
                });
            }
        });
        /**
         * Approve provider application
         * PATCH /api/admin/providers/:id/approve
         */
        this.approveProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ success: false, errors: errors.array() });
                }
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const { qualifiedCategories } = req.body;
                const adminId = req.user.id;
                const provider = yield adminService_1.adminService.approveProvider({
                    providerId: parseInt(id),
                    adminId,
                    qualifiedCategories
                });
                res.json({
                    success: true,
                    message: 'Provider approved successfully',
                    data: provider
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Provider approval failed'
                });
            }
        });
        /**
         * Reject provider application
         * PATCH /api/admin/providers/:id/reject
         */
        this.rejectProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const { reason } = req.body;
                const adminId = req.user.id;
                const provider = yield adminService_1.adminService.rejectProvider(parseInt(id), adminId, reason);
                res.json({
                    success: true,
                    message: 'Provider application rejected',
                    data: provider
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Provider rejection failed'
                });
            }
        });
        /**
         * Suspend provider
         * PATCH /api/admin/providers/:id/suspend
         */
        this.suspendProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const { reason } = req.body;
                const adminId = req.user.id;
                const provider = yield adminService_1.adminService.suspendProvider(parseInt(id), adminId, reason);
                res.json({
                    success: true,
                    message: 'Provider suspended successfully',
                    data: provider
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Provider suspension failed'
                });
            }
        });
        /**
         * Reactivate suspended provider
         * PATCH /api/admin/providers/:id/reactivate
         */
        this.reactivateProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const adminId = req.user.id;
                const provider = yield adminService_1.adminService.reactivateProvider(parseInt(id), adminId);
                res.json({
                    success: true,
                    message: 'Provider reactivated successfully',
                    data: provider
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Provider reactivation failed'
                });
            }
        });
        /**
         * Update user profile
         * PATCH /api/admin/users/:id
         */
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const updates = req.body;
                const user = yield adminService_1.adminService.updateUserProfile(parseInt(id), updates);
                res.json({
                    success: true,
                    message: 'User updated successfully',
                    data: user
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'User update failed'
                });
            }
        });
        /**
         * Delete user
         * DELETE /api/admin/users/:id
         */
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { id } = req.params;
                const adminId = req.user.id;
                yield adminService_1.adminService.deleteUser(parseInt(id), adminId);
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'User deletion failed'
                });
            }
        });
        /**
         * Get platform analytics
         * GET /api/admin/analytics
         */
        this.getAnalytics = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
                    return res.status(403).json({ success: false, message: 'Admin access required' });
                }
                const { days } = req.query;
                const analytics = yield adminService_1.adminService.getAnalytics(days ? parseInt(days) : undefined);
                res.json({
                    success: true,
                    data: analytics
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get analytics'
                });
            }
        });
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
