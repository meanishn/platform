"use strict";
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
exports.googleCallback = exports.verify = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = require("../services/authService");
const responseHelper_1 = require("../utils/responseHelper");
const sanitizers_1 = require("../sanitizers");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        return responseHelper_1.ResponseHelper.validationError(res, responseHelper_1.ResponseHelper.formatValidationErrors(result.array()));
    }
    const { email, password, firstName, lastName } = req.body;
    const existingUser = yield (0, authService_1.getUser)(email);
    if (existingUser) {
        return responseHelper_1.ResponseHelper.conflict(res, 'User already exists');
    }
    const user = yield (0, authService_1.registerUser)(email, password, firstName, lastName);
    const token = (0, authService_1.generateJwtForUser)(user);
    const authResponse = {
        user: (0, sanitizers_1.toAuthUserDto)(user),
        token
    };
    return responseHelper_1.ResponseHelper.created(res, authResponse, 'Registration successful');
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield (0, authService_1.authenticateUser)(email, password);
    if (!user) {
        return responseHelper_1.ResponseHelper.unauthorized(res, 'Invalid credentials');
    }
    const token = (0, authService_1.generateJwtForUser)(user);
    const authResponse = {
        user: (0, sanitizers_1.toAuthUserDto)(user),
        token
    };
    return responseHelper_1.ResponseHelper.success(res, authResponse, 'Login successful');
});
exports.login = login;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return responseHelper_1.ResponseHelper.unauthorized(res, 'Not authenticated');
    }
    // Convert Express.User to User model for sanitization
    const userDto = (0, sanitizers_1.toAuthUserDto)(req.user);
    return responseHelper_1.ResponseHelper.success(res, { user: userDto });
});
exports.verify = verify;
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return responseHelper_1.ResponseHelper.unauthorized(res, 'Authentication failed');
    }
    const token = (0, authService_1.generateJwtForUser)(req.user);
    const authResponse = {
        user: (0, sanitizers_1.toAuthUserDto)(req.user),
        token
    };
    return responseHelper_1.ResponseHelper.success(res, authResponse, 'Google authentication successful');
});
exports.googleCallback = googleCallback;
