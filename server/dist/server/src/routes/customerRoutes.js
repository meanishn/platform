"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Customer dashboard
router.get('/dashboard/stats', authMiddleware_1.requireAuth, dashboardController_1.dashboardController.getCustomerStats);
router.get('/dashboard/activity', authMiddleware_1.requireAuth, dashboardController_1.dashboardController.getCustomerActivity);
exports.default = router;
