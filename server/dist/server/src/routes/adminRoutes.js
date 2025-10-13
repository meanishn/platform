"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All admin routes require admin authentication
router.use(authMiddleware_1.requireAdmin);
// User management
router.get('/users', adminController_1.adminController.getUsers);
router.patch('/users/:id', adminController_1.adminController.updateUser);
router.delete('/users/:id', adminController_1.adminController.deleteUser);
// Provider management
router.get('/providers/pending', adminController_1.adminController.getPendingProviders);
router.get('/providers/:id', adminController_1.adminController.getProviderDetails);
router.patch('/providers/:id/approve', adminController_1.adminController.approveProvider);
router.patch('/providers/:id/reject', adminController_1.adminController.rejectProvider);
router.patch('/providers/:id/suspend', adminController_1.adminController.suspendProvider);
router.patch('/providers/:id/reactivate', adminController_1.adminController.reactivateProvider);
// Analytics
router.get('/analytics', adminController_1.adminController.getAnalytics);
// Dashboard
router.get('/dashboard/stats', dashboardController_1.dashboardController.getAdminStats);
router.get('/dashboard/activity', dashboardController_1.dashboardController.getAdminActivity);
exports.default = router;
