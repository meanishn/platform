"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUser = void 0;
exports.validateCreateUser = {
    email: {
        in: "body",
        isEmail: {
            errorMessage: "Invalid email format",
        },
        normalizeEmail: true,
    },
    password: {
        in: "body",
        isLength: {
            options: { min: 3 },
            errorMessage: "Password must be at least 3 characters long",
        },
    },
};
