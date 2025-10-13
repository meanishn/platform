"use strict";
/**
 * Request Controller - Assignment-Based Model
 *
 * Handles HTTP requests for service request operations
 * Based on Technical Spec v1.1 - No proposals, automatic assignment
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
exports.requestController = exports.RequestController = void 0;
const express_validator_1 = require("express-validator");
const requestService_1 = require("../services/requestService");
class RequestController {
    constructor() {
        /**
         * Create a new service request
         * POST /api/service-requests
         */
        this.createRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ success: false, errors: errors.array() });
                }
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { categoryId, tierId, title, description, address, latitude, longitude, preferredDate, urgency, estimatedHours, images } = req.body;
                const request = yield requestService_1.requestService.createRequest({
                    userId,
                    categoryId,
                    tierId,
                    title,
                    description,
                    address,
                    latitude,
                    longitude,
                    preferredDate,
                    urgency,
                    estimatedHours,
                    images
                });
                res.status(201).json({
                    success: true,
                    message: 'Service request created successfully. Notifying qualified providers...',
                    data: request
                });
            }
            catch (error) {
                console.error('Error creating request:', error);
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Request creation failed'
                });
            }
        });
        /**
         * Customer confirms a provider among acceptances
         * POST /api/service-requests/:id/confirm
         */
        this.confirmProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { id } = req.params;
                const { providerId } = req.body;
                if (!providerId) {
                    return res.status(400).json({ success: false, message: 'providerId is required' });
                }
                const updated = yield requestService_1.requestService.confirmProvider(parseInt(id), userId, parseInt(providerId));
                res.json({
                    success: true,
                    message: 'Provider confirmed successfully',
                    data: updated
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Confirmation failed'
                });
            }
        });
        /**
         * Provider accepts an assignment
         * PATCH /api/assignments/:notificationId/accept
         */
        this.acceptAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { requestId } = req.body;
                if (!requestId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Request ID is required'
                    });
                }
                const request = yield requestService_1.requestService.acceptAssignment(parseInt(requestId), providerId);
                res.json({
                    success: true,
                    message: 'Assignment accepted successfully',
                    data: request
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Assignment acceptance failed';
                const status = message.includes('no longer available') || message.includes('not found') ? 409 : 400;
                res.status(status).json({
                    success: false,
                    message
                });
            }
        });
        /**
         * Provider declines an assignment
         * PATCH /api/assignments/:notificationId/decline
         */
        this.declineAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { requestId, reason } = req.body;
                if (!requestId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Request ID is required'
                    });
                }
                yield requestService_1.requestService.declineAssignment(parseInt(requestId), providerId, reason);
                res.json({
                    success: true,
                    message: 'Assignment declined'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Assignment decline failed'
                });
            }
        });
        /**
         * Start a job
         * PATCH /api/service-requests/:id/start
         */
        this.startJob = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { id } = req.params;
                const request = yield requestService_1.requestService.startJob(parseInt(id), providerId);
                res.json({
                    success: true,
                    message: 'Job started successfully',
                    data: request
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Job start failed'
                });
            }
        });
        /**
         * Complete a job
         * PATCH /api/service-requests/:id/complete
         */
        this.completeJob = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { id } = req.params;
                const request = yield requestService_1.requestService.completeJob(parseInt(id), providerId);
                res.json({
                    success: true,
                    message: 'Job completed successfully',
                    data: request
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Job completion failed'
                });
            }
        });
        /**
         * Cancel a request
         * PATCH /api/service-requests/:id/cancel
         */
        this.cancelRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { id } = req.params;
                const { reason } = req.body;
                const request = yield requestService_1.requestService.cancelRequest(parseInt(id), userId, reason);
                res.json({
                    success: true,
                    message: 'Request cancelled successfully',
                    data: request
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Cancellation failed'
                });
            }
        });
        /**
         * Get user's requests (for customers)
         * GET /api/service-requests
         */
        this.getUserRequests = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { status } = req.query;
                const requests = yield requestService_1.requestService.getUserRequests(userId, status);
                res.json({
                    success: true,
                    data: requests
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get requests'
                });
            }
        });
        /**
         * Get provider's assignments
         * GET /api/providers/assignments
         */
        this.getProviderAssignments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const providerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!providerId || !((_b = req.user) === null || _b === void 0 ? void 0 : _b.isApprovedProvider)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Approved provider access required'
                    });
                }
                const { status } = req.query;
                const assignments = yield requestService_1.requestService.getProviderAssignments(providerId, status);
                res.json({
                    success: true,
                    data: assignments
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get assignments'
                });
            }
        });
        /**
         * Get request details
         * GET /api/service-requests/:id
         */
        this.getRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const request = yield requestService_1.requestService.getRequestDetails(parseInt(id), userId);
                if (!request) {
                    return res.status(404).json({ success: false, message: 'Request not found' });
                }
                res.json({
                    success: true,
                    data: request
                });
            }
            catch (error) {
                const status = error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to get request'
                });
            }
        });
        /**
         * Get assigned provider for a request
         * GET /api/requests/:requestId/assigned-provider
         */
        this.getAssignedProvider = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                const provider = yield requestService_1.requestService.getAssignedProvider(parseInt(requestId));
                if (!provider) {
                    return res.status(404).json({
                        success: false,
                        message: 'No provider assigned yet'
                    });
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
         * Get accepted providers for a request (customer only)
         * GET /api/service-requests/:id/accepted-providers
         */
        this.getAcceptedProviders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const { id } = req.params;
                const result = yield requestService_1.requestService.getAcceptedProvidersForCustomer(parseInt(id), userId);
                if (!result) {
                    return res.status(404).json({ success: false, message: 'Request not found' });
                }
                res.json({ success: true, data: result });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to get accepted providers';
                const status = message.includes('Unauthorized') ? 403 : 400;
                res.status(status).json({ success: false, message });
            }
        });
    }
}
exports.RequestController = RequestController;
exports.requestController = new RequestController();
