"use strict";
/**
 * Dashboard Service
 *
 * Provides statistics and analytics for all user roles
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const User_1 = __importDefault(require("../models/User"));
const Review_1 = __importDefault(require("../models/Review"));
class DashboardService {
    /**
     * Get customer dashboard statistics
     */
    getCustomerStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get active requests
            const activeRequests = yield ServiceRequest_1.default.query()
                .where('user_id', userId)
                .whereIn('status', ['pending', 'assigned', 'in_progress'])
                .resultSize();
            // Get completed jobs
            const completedJobs = yield ServiceRequest_1.default.query()
                .where('user_id', userId)
                .where('status', 'completed')
                .resultSize();
            // Calculate total spent (estimate based on tier rates)
            const completedRequests = yield ServiceRequest_1.default.query()
                .where('user_id', userId)
                .where('status', 'completed')
                .withGraphFetched('tier')
                .select();
            const totalSpent = completedRequests.reduce((sum, request) => {
                var _a;
                const estimatedCost = (((_a = request.tier) === null || _a === void 0 ? void 0 : _a.base_hourly_rate) || 0) * (request.estimated_hours || 1);
                return sum + estimatedCost;
            }, 0);
            // Get pending reviews
            const completedRequestIds = completedRequests.map(r => r.id);
            const existingReviewIds = yield Review_1.default.query()
                .whereIn('request_id', completedRequestIds)
                .select('request_id');
            const reviewedIds = new Set(existingReviewIds.map(r => r.request_id));
            const pendingReviews = completedRequests.filter(r => !reviewedIds.has(r.id)).length;
            return {
                activeRequests,
                completedJobs,
                totalSpent: Math.round(totalSpent),
                pendingReviews
            };
        });
    }
    /**
     * Get customer activity feed
     */
    getCustomerActivity(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 20) {
            const requests = yield ServiceRequest_1.default.query()
                .where('user_id', userId)
                .withGraphFetched('[category, assignedProvider]')
                .orderBy('updated_at', 'desc')
                .limit(limit);
            return requests.map(request => {
                var _a, _b;
                return ({
                    id: `request-${request.id}`,
                    type: 'service_request',
                    title: request.title,
                    description: this.getRequestStatusDescription(request),
                    timestamp: request.updated_at,
                    metadata: {
                        requestId: request.id,
                        status: request.status,
                        category: (_a = request.category) === null || _a === void 0 ? void 0 : _a.name,
                        providerName: (_b = request.assignedProvider) === null || _b === void 0 ? void 0 : _b.fullName
                    }
                });
            });
        });
    }
    /**
     * Get provider dashboard statistics
     */
    getProviderStats(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get provider details
            const provider = yield User_1.default.query().findById(providerId);
            if (!provider) {
                throw new Error('Provider not found');
            }
            // Get active requests
            const activeRequests = yield ServiceRequest_1.default.query()
                .where('assigned_provider_id', providerId)
                .whereIn('status', ['assigned', 'in_progress'])
                .resultSize();
            // Get completed jobs
            const completedJobs = provider.total_jobs_completed || 0;
            // Calculate total earnings (estimate)
            const completedRequests = yield ServiceRequest_1.default.query()
                .where('assigned_provider_id', providerId)
                .where('status', 'completed')
                .withGraphFetched('tier')
                .select();
            const totalEarnings = completedRequests.reduce((sum, request) => {
                var _a;
                const earning = (((_a = request.tier) === null || _a === void 0 ? void 0 : _a.base_hourly_rate) || 0) * (request.estimated_hours || 1);
                return sum + earning;
            }, 0);
            // Calculate completion rate
            const totalJobs = completedJobs + (provider.total_jobs_declined || 0);
            const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 100;
            // Format response time
            const responseTime = provider.response_time_average
                ? `${provider.response_time_average}m`
                : 'N/A';
            // Get pending assignment notifications
            const pendingAssignments = 0; // This would come from notifications table
            return {
                activeRequests,
                completedJobs,
                totalEarnings: Math.round(totalEarnings),
                averageRating: provider.average_rating || 0,
                responseTime,
                completionRate: Math.round(completionRate),
                pendingAssignments
            };
        });
    }
    /**
     * Get provider activity/recent requests
     */
    getProviderActivity(providerId_1) {
        return __awaiter(this, arguments, void 0, function* (providerId, limit = 20) {
            const requests = yield ServiceRequest_1.default.query()
                .where('assigned_provider_id', providerId)
                .withGraphFetched('[category, user]')
                .orderBy('updated_at', 'desc')
                .limit(limit);
            return requests.map(request => {
                var _a, _b;
                return ({
                    id: `request-${request.id}`,
                    type: 'assignment',
                    title: request.title,
                    description: this.getRequestStatusDescription(request),
                    timestamp: request.updated_at,
                    metadata: {
                        requestId: request.id,
                        status: request.status,
                        category: (_a = request.category) === null || _a === void 0 ? void 0 : _a.name,
                        customerName: (_b = request.user) === null || _b === void 0 ? void 0 : _b.fullName,
                        urgency: request.urgency
                    }
                });
            });
        });
    }
    /**
     * Get admin dashboard statistics
     */
    getAdminStats() {
        return __awaiter(this, void 0, void 0, function* () {
            // Total users
            const totalUsers = yield User_1.default.query().resultSize();
            // Total providers (approved)
            const totalProviders = yield User_1.default.query()
                .where('is_service_provider', true)
                .where('provider_status', 'approved')
                .resultSize();
            // Total customers
            const totalCustomers = yield User_1.default.query()
                .where('is_service_provider', false)
                .where('is_admin', false)
                .resultSize();
            // Pending verifications
            const pendingVerifications = yield User_1.default.query()
                .where('is_service_provider', true)
                .where('provider_status', 'pending')
                .resultSize();
            // Active requests
            const activeRequests = yield ServiceRequest_1.default.query()
                .whereIn('status', ['pending', 'assigned', 'in_progress'])
                .resultSize();
            // Completed requests
            const completedRequests = yield ServiceRequest_1.default.query()
                .where('status', 'completed')
                .resultSize();
            // Total revenue (estimate)
            const allCompletedRequests = yield ServiceRequest_1.default.query()
                .where('status', 'completed')
                .withGraphFetched('tier')
                .select();
            const totalRevenue = allCompletedRequests.reduce((sum, request) => {
                var _a;
                const revenue = (((_a = request.tier) === null || _a === void 0 ? void 0 : _a.base_hourly_rate) || 0) * (request.estimated_hours || 1);
                return sum + revenue;
            }, 0);
            // Monthly growth (simplified - compare this month vs last month)
            const now = new Date();
            const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thisMonthRequests = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', firstDayThisMonth.toISOString())
                .resultSize();
            const lastMonthRequests = yield ServiceRequest_1.default.query()
                .where('created_at', '>=', firstDayLastMonth.toISOString())
                .where('created_at', '<', firstDayThisMonth.toISOString())
                .resultSize();
            const monthlyGrowth = lastMonthRequests > 0
                ? ((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100
                : 0;
            return {
                totalUsers,
                totalProviders,
                totalCustomers,
                pendingVerifications,
                activeRequests,
                completedRequests,
                totalRevenue: Math.round(totalRevenue),
                monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
            };
        });
    }
    /**
     * Get admin activity feed
     */
    getAdminActivity() {
        return __awaiter(this, arguments, void 0, function* (limit = 50) {
            // Get recent service requests
            const requests = yield ServiceRequest_1.default.query()
                .withGraphFetched('[user, category, assignedProvider]')
                .orderBy('created_at', 'desc')
                .limit(limit);
            const activities = requests.map(request => {
                var _a, _b;
                return ({
                    id: `request-${request.id}`,
                    type: 'service_request',
                    title: `${(_a = request.user) === null || _a === void 0 ? void 0 : _a.fullName} requested ${(_b = request.category) === null || _b === void 0 ? void 0 : _b.name}`,
                    description: `Status: ${request.status}`,
                    timestamp: request.created_at,
                    metadata: {
                        requestId: request.id,
                        userId: request.user_id,
                        status: request.status
                    }
                });
            });
            return activities;
        });
    }
    /**
     * Get request status description for activity feed
     */
    getRequestStatusDescription(request) {
        var _a;
        switch (request.status) {
            case 'pending':
                return 'Waiting for provider assignment';
            case 'assigned':
                return `Assigned to ${((_a = request.assignedProvider) === null || _a === void 0 ? void 0 : _a.fullName) || 'provider'}`;
            case 'in_progress':
                return 'Work in progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return request.status;
        }
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
