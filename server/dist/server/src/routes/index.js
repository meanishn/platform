"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const providerRoutes_1 = __importDefault(require("./providerRoutes"));
const requestRoutes_1 = __importDefault(require("./requestRoutes"));
const reviewRoutes_1 = __importDefault(require("./reviewRoutes"));
const notificationRoutes_1 = __importDefault(require("./notificationRoutes"));
const serviceRoutes_1 = __importDefault(require("./serviceRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const customerRoutes_1 = __importDefault(require("./customerRoutes"));
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});
// Route modules
router.use('/auth', authRoutes_1.default);
router.use('/service-categories', serviceRoutes_1.default); // GET service categories and tiers
router.use('/service-requests', requestRoutes_1.default); // Service request CRUD
router.use('/providers', providerRoutes_1.default); // Provider assignments and dashboard
router.use('/customers', customerRoutes_1.default); // Customer dashboard
router.use('/reviews', reviewRoutes_1.default); // Review system
router.use('/notifications', notificationRoutes_1.default); // Notification management
router.use('/admin', adminRoutes_1.default); // Admin management
// Generic dashboard (role-based routing)
router.get('/dashboard/stats', authMiddleware_1.requireAuth, dashboardController_1.dashboardController.getDashboardStats);
exports.default = router;
