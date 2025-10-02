import { Schema } from "express-validator";

export const validateCreateUser: Schema = {
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
}