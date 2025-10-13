"use strict";
/**
 * Response Helper Utilities
 * Provides consistent response formatting across all endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    /**
     * Send success response
     */
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            message
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send success response with 201 Created status
     */
    static created(res, data, message) {
        return ResponseHelper.success(res, data, message, 201);
    }
    /**
     * Send error response
     */
    static error(res, message, statusCode = 400, errors) {
        const response = {
            success: false,
            message,
            errors
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send validation error response
     */
    static validationError(res, errors, message = 'Validation failed') {
        return ResponseHelper.error(res, message, 400, errors);
    }
    /**
     * Send unauthorized error
     */
    static unauthorized(res, message = 'Authentication required') {
        return ResponseHelper.error(res, message, 401);
    }
    /**
     * Send forbidden error
     */
    static forbidden(res, message = 'Access denied') {
        return ResponseHelper.error(res, message, 403);
    }
    /**
     * Send not found error
     */
    static notFound(res, message = 'Resource not found') {
        return ResponseHelper.error(res, message, 404);
    }
    /**
     * Send conflict error
     */
    static conflict(res, message = 'Resource conflict') {
        return ResponseHelper.error(res, message, 409);
    }
    /**
     * Send internal server error
     */
    static serverError(res, message = 'Internal server error') {
        return ResponseHelper.error(res, message, 500);
    }
    /**
     * Convert express-validator errors to ValidationError format
     */
    static formatValidationErrors(errors) {
        return errors.map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));
    }
}
exports.ResponseHelper = ResponseHelper;
