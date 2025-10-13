"use strict";
/**
 * Admin Service
 *
 * Handles administrative functions for platform management
 * Based on Technical Spec v1.1
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const User_1 = __importDefault(require("../models/User"));
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const ProviderCategory_1 = __importDefault(require("../models/ProviderCategory"));
const notificationService_1 = require("./notificationService");
class AdminService {
    /**
     * Get list of all users with filtering
     */
    getUsers() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            let query = User_1.default.query()
                .select([
                'id',
                'email',
                'first_name',
                'last_name',
                'phone',
                'is_service_provider',
                'is_admin',
                'provider_status',
                'average_rating',
                'total_jobs_completed',
                'is_available',
                'created_at'
            ]);
            // Apply filters
            if (filters.role) {
                if (filters.role === 'admin') {
                    query = query.where('is_admin', true);
                }
                else if (filters.role === 'provider') {
                    query = query.where('is_service_provider', true);
                }
                else {
                    query = query.where('is_service_provider', false).where('is_admin', false);
                }
            }
            if (filters.status) {
                query = query.where('provider_status', filters.status);
            }
            if (filters.searchQuery) {
                const search = `%${filters.searchQuery}%`;
                query = query.where(builder => {
                    builder
                        .where('email', 'ilike', search)
                        .orWhere('first_name', 'ilike', search)
                        .orWhere('last_name', 'ilike', search);
                });
            }
            // Get total count
            const totalQuery = query.clone();
            const totalResult = yield totalQuery.count('* as count').first();
            const total = parseInt((totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) || '0');
            // Apply pagination
            const limit = filters.limit || 50;
            const offset = filters.offset || 0;
            const users = yield query
                .limit(limit)
                .offset(offset)
                .orderBy('created_at', 'desc');
            return { users, total };
        });
    }
    /**
     * Get provider details with qualifications
     */
    getProviderDetails(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.query()
                .findById(providerId)
                .withGraphFetched('[providerCategories.category, receivedReviews, approver]');
        });
    }
    /**
     * Get pending provider applications
     */
    getPendingProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.query()
                .where('is_service_provider', true)
                .where('provider_status', 'pending')
                .withGraphFetched('providerCategories.category')
                .orderBy('created_at', 'asc');
        });
    }
    /**
     * Approve a provider application
     */
    approveProvider(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield User_1.default.query().findById(data.providerId);
            if (!provider) {
                throw new Error('Provider not found');
            }
            if (!provider.is_service_provider) {
                throw new Error('User is not a service provider');
            }
            if (provider.provider_status === 'approved') {
                throw new Error('Provider is already approved');
            }
            // Update provider status
            const updatedProvider = yield User_1.default.query()
                .patchAndFetchById(data.providerId, {
                provider_status: 'approved',
                provider_approved_at: new Date().toISOString(),
                approved_by: data.adminId,
                is_available: true
            });
            // Set qualified categories and tiers if provided
            if (data.qualifiedCategories && data.qualifiedCategories.length > 0) {
                // Delete existing qualifications
                yield ProviderCategory_1.default.query()
                    .delete()
                    .where('provider_id', data.providerId);
                // Insert new qualifications
                for (const qual of data.qualifiedCategories) {
                    yield ProviderCategory_1.default.query().insert({
                        provider_id: data.providerId,
                        category_id: qual.categoryId,
                        qualified_tiers: qual.tiers,
                        is_verified: true,
                        verified_at: new Date().toISOString(),
                        verified_by: data.adminId
                    });
                }
            }
            // Notify provider
            yield notificationService_1.notificationService.createNotification({
                userId: data.providerId,
                type: 'provider_approved',
                title: 'Application Approved!',
                message: 'Your provider application has been approved. You can now receive service requests!',
                data: { providerId: data.providerId }
            });
            console.log(`✅ Provider ${data.providerId} approved by admin ${data.adminId}`);
            return updatedProvider;
        });
    }
    /**
     * Reject a provider application
     */
    rejectProvider(providerId, adminId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield User_1.default.query().findById(providerId);
            if (!provider) {
                throw new Error('Provider not found');
            }
            if (!provider.is_service_provider) {
                throw new Error('User is not a service provider');
            }
            const updatedProvider = yield User_1.default.query()
                .patchAndFetchById(providerId, {
                provider_status: 'rejected',
                approved_by: adminId
            });
            // Notify provider
            yield notificationService_1.notificationService.createNotification({
                userId: providerId,
                type: 'provider_rejected',
                title: 'Application Not Approved',
                message: reason || 'Your provider application was not approved at this time.',
                data: { providerId, reason }
            });
            console.log(`❌ Provider ${providerId} rejected by admin ${adminId}`);
            return updatedProvider;
        });
    }
    /**
     * Suspend a provider
     */
    suspendProvider(providerId, adminId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield User_1.default.query().findById(providerId);
            if (!provider) {
                throw new Error('Provider not found');
            }
            if (!provider.is_service_provider) {
                throw new Error('User is not a service provider');
            }
            const updatedProvider = yield User_1.default.query()
                .patchAndFetchById(providerId, {
                provider_status: 'suspended',
                is_available: false
            });
            // Notify provider
            yield notificationService_1.notificationService.createNotification({
                userId: providerId,
                type: 'provider_suspended',
                title: 'Account Suspended',
                message: reason || 'Your provider account has been suspended.',
                data: { providerId, reason }
            });
            // Cancel any active assignments
            yield ServiceRequest_1.default.query()
                .patch({ status: 'cancelled' })
                .where('assigned_provider_id', providerId)
                .whereIn('status', ['assigned', 'in_progress']);
            console.log(`⚠️ Provider ${providerId} suspended by admin ${adminId}`);
            return updatedProvider;
        });
    }
    /**
     * Reactivate a suspended provider
     */
    reactivateProvider(providerId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield User_1.default.query().findById(providerId);
            if (!provider) {
                throw new Error('Provider not found');
            }
            if (provider.provider_status !== 'suspended') {
                throw new Error('Provider is not suspended');
            }
            const updatedProvider = yield User_1.default.query()
                .patchAndFetchById(providerId, {
                provider_status: 'approved',
                is_available: true
            });
            // Notify provider
            yield notificationService_1.notificationService.createNotification({
                userId: providerId,
                type: 'provider_reactivated',
                title: 'Account Reactivated',
                message: 'Your provider account has been reactivated.',
                data: { providerId }
            });
            console.log(`✅ Provider ${providerId} reactivated by admin ${adminId}`);
            return updatedProvider;
        });
    }
    /**
     * Update user profile (admin override)
     */
    updateUserProfile(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.query().findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Remove sensitive fields that shouldn't be updated this way
            const _a = updates, { password } = _a, safeUpdates = __rest(_a, ["password"]);
            return User_1.default.query().patchAndFetchById(userId, safeUpdates);
        });
    }
    /**
     * Delete user account
     */
    deleteUser(userId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.query().findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Don't allow deleting admins (safety check)
            if (user.is_admin) {
                throw new Error('Cannot delete admin users');
            }
            // Cancel all active requests
            yield ServiceRequest_1.default.query()
                .patch({ status: 'cancelled' })
                .where(builder => {
                builder
                    .where('user_id', userId)
                    .orWhere('assigned_provider_id', userId);
            })
                .whereIn('status', ['pending', 'assigned', 'in_progress']);
            // Delete user
            yield User_1.default.query().deleteById(userId);
            console.log(`🗑️ User ${userId} deleted by admin ${adminId}`);
        });
    }
    /**
     * Get platform analytics
     */
    getAnalytics() {
        return __awaiter(this, arguments, void 0, function* (days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            // Requests over time
            const requestsOverTime = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', startDate.toISOString())
                .select('created_at')
                .then(requests => {
                const counts = {};
                requests.forEach(request => {
                    const date = request.created_at.split('T')[0];
                    counts[date] = (counts[date] || 0) + 1;
                });
                return Object.entries(counts).map(([date, count]) => ({ date, count }));
            });
            // Categories distribution
            const categoriesDistribution = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', startDate.toISOString())
                .withGraphFetched('category')
                .then(requests => {
                const counts = {};
                requests.forEach(request => {
                    var _a;
                    const category = ((_a = request.category) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
                    counts[category] = (counts[category] || 0) + 1;
                });
                return Object.entries(counts).map(([category, count]) => ({ category, count }));
            });
            // Average response time (simplified - time from creation to assignment)
            const assignedRequests = yield ServiceRequest_1.default.query()
                .whereNotNull('assigned_at')
                .where('created_at', '>=', startDate.toISOString())
                .select('created_at', 'assigned_at');
            const averageResponseTime = assignedRequests.length > 0
                ? assignedRequests.reduce((sum, request) => {
                    const created = new Date(request.created_at).getTime();
                    const assigned = new Date(request.assigned_at).getTime();
                    return sum + (assigned - created) / 1000 / 60; // minutes
                }, 0) / assignedRequests.length
                : 0;
            // Completion rate
            const totalRequests = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', startDate.toISOString())
                .resultSize();
            const completedRequests = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', startDate.toISOString())
                .where('status', 'completed')
                .resultSize();
            const completionRate = totalRequests > 0
                ? (completedRequests / totalRequests) * 100
                : 0;
            return {
                requestsOverTime,
                categoriesDistribution,
                averageResponseTime: Math.round(averageResponseTime),
                completionRate: Math.round(completionRate)
            };
        });
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
