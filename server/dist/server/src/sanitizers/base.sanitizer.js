"use strict";
/**
 * Base Sanitizer
 * Common utilities and types for all sanitizers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENSITIVE_FIELDS = void 0;
exports.removeSensitiveFields = removeSensitiveFields;
exports.sanitizeArray = sanitizeArray;
exports.pick = pick;
exports.omit = omit;
exports.toCamelCase = toCamelCase;
exports.objectToCamelCase = objectToCamelCase;
/**
 * Sensitive fields that should NEVER be sent to clients
 */
exports.SENSITIVE_FIELDS = ['password', 'googleId'];
/**
 * Remove sensitive fields from any object
 */
function removeSensitiveFields(obj, fieldsToRemove = exports.SENSITIVE_FIELDS) {
    const sanitized = Object.assign({}, obj);
    fieldsToRemove.forEach(field => {
        delete sanitized[field];
    });
    return sanitized;
}
/**
 * Sanitize array of objects using a sanitizer function
 */
function sanitizeArray(items, sanitizer) {
    return items.map(sanitizer);
}
/**
 * Pick specific fields from an object
 */
function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    });
    return result;
}
/**
 * Omit specific fields from an object
 */
function omit(obj, keys) {
    const result = Object.assign({}, obj);
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}
/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Convert object keys from snake_case to camelCase
 */
function objectToCamelCase(obj) {
    const result = {};
    Object.keys(obj).forEach(key => {
        result[toCamelCase(key)] = obj[key];
    });
    return result;
}
