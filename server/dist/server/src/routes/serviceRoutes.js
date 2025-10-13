"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const serviceController = new serviceController_1.ServiceController();
// Public routes
router.get('/categories', serviceController.getCategories);
router.get('/categories/:categoryId/tiers', serviceController.getCategoryTiers);
// Admin routes
router.post('/categories', authMiddleware_1.requireAdmin, serviceController.createCategory);
router.patch('/categories/:categoryId', authMiddleware_1.requireAdmin, serviceController.updateCategory);
router.post('/tiers', authMiddleware_1.requireAdmin, serviceController.createTier);
router.patch('/tiers/:tierId', authMiddleware_1.requireAdmin, serviceController.updateTier);
exports.default = router;
