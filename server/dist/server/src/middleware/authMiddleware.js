"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.requireApprovedProvider = exports.requireAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const requireAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Authentication error' });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.requireAuth = requireAuth;
const requireApprovedProvider = (req, res, next) => {
    (0, exports.requireAuth)(req, res, () => {
        var _a, _b;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_service_provider) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.provider_status) !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Approved service provider access required'
            });
        }
        next();
    });
};
exports.requireApprovedProvider = requireApprovedProvider;
const requireAdmin = (req, res, next) => {
    (0, exports.requireAuth)(req, res, () => {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.is_admin)) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        next();
    });
};
exports.requireAdmin = requireAdmin;
const optionalAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (!err && user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};
exports.optionalAuth = optionalAuth;
