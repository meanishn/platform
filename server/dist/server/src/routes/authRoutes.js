"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const user_validation_1 = require("../validators/user.validation");
const requestValidation_1 = require("../middleware/requestValidation");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', (0, requestValidation_1.withValidation)(user_validation_1.validateCreateUser), authController_1.register);
router.post('/login', authController_1.login);
router.get('/verify', authMiddleware_1.requireAuth, authController_1.verify);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
}), authController_1.googleCallback);
exports.default = router;
