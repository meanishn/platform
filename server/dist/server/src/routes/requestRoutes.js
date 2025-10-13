"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../controllers/requestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Service request management
router.post('/', authMiddleware_1.requireAuth, requestController_1.requestController.createRequest);
router.get('/', authMiddleware_1.requireAuth, requestController_1.requestController.getUserRequests);
router.get('/:id', authMiddleware_1.requireAuth, requestController_1.requestController.getRequest);
router.patch('/:id/cancel', authMiddleware_1.requireAuth, requestController_1.requestController.cancelRequest);
router.post('/:id/confirm', authMiddleware_1.requireAuth, requestController_1.requestController.confirmProvider);
router.get('/:id/accepted-providers', authMiddleware_1.requireAuth, requestController_1.requestController.getAcceptedProviders);
// Provider job management
router.patch('/:id/start', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.startJob);
router.patch('/:id/complete', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.completeJob);
// Get assigned provider info
router.get('/:requestId/assigned-provider', authMiddleware_1.requireAuth, requestController_1.requestController.getAssignedProvider);
exports.default = router;
