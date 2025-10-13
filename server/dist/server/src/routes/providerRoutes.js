"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../controllers/requestController");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Provider assignments (new assignment-based model)
router.get('/assignments', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.getProviderAssignments);
router.patch('/assignments/accept', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.acceptAssignment);
router.patch('/assignments/decline', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.declineAssignment);
// Provider request details
router.get('/requests/:id', authMiddleware_1.requireApprovedProvider, requestController_1.requestController.getRequest);
// Provider dashboard
router.get('/dashboard/stats', authMiddleware_1.requireApprovedProvider, dashboardController_1.dashboardController.getProviderStats);
router.get('/dashboard/requests', authMiddleware_1.requireApprovedProvider, dashboardController_1.dashboardController.getProviderActivity);
exports.default = router;
