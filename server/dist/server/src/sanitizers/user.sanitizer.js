"use strict";
/**
 * User Sanitizer
 * Handles all user-related data sanitization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthUserDto = toAuthUserDto;
exports.toPublicUserDto = toPublicUserDto;
exports.toProviderProfileDto = toProviderProfileDto;
exports.toProviderWithContactDto = toProviderWithContactDto;
exports.toPublicUserDtoArray = toPublicUserDtoArray;
exports.toProviderProfileDtoArray = toProviderProfileDtoArray;
exports.toProviderWithContactDtoArray = toProviderWithContactDtoArray;
const base_sanitizer_1 = require("./base.sanitizer");
/**
 * Convert User model to AuthUserDto (authenticated user's own profile)
 * Includes personal info but NEVER includes password
 */
function toAuthUserDto(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        profileImage: user.profile_image,
        role: user.role,
        isServiceProvider: user.is_service_provider,
        isAdmin: user.is_admin,
        providerStatus: user.provider_status,
        providerBio: user.provider_bio,
        providerSkills: user.provider_skills,
        providerCertifications: user.provider_certifications,
        averageRating: user.average_rating,
        totalJobsCompleted: user.total_jobs_completed,
        totalJobsDeclined: user.total_jobs_declined,
        responseTimeAverage: user.response_time_average,
        isAvailable: user.is_available,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
}
/**
 * Convert User model to PublicUserDto (public profile)
 * Safe to show to anyone - NO contact info, NO sensitive data
 */
function toPublicUserDto(user) {
    return {
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        profileImage: user.profile_image,
        averageRating: user.average_rating,
        totalJobsCompleted: user.total_jobs_completed,
        role: user.role
    };
}
/**
 * Convert User model to ProviderProfileDto (provider listing)
 * Includes provider-specific info but NO contact details
 */
function toProviderProfileDto(user) {
    return Object.assign(Object.assign({}, toPublicUserDto(user)), { providerBio: user.provider_bio, providerSkills: user.provider_skills, responseTimeAverage: user.response_time_average, isAvailable: user.is_available });
}
/**
 * Convert User model to ProviderWithContactDto
 * ONLY use for confirmed assignments - includes contact information
 */
function toProviderWithContactDto(user) {
    return Object.assign(Object.assign({}, toProviderProfileDto(user)), { email: user.email, phone: user.phone });
}
/**
 * Sanitize array of users to public DTOs
 */
function toPublicUserDtoArray(users) {
    return (0, base_sanitizer_1.sanitizeArray)(users, toPublicUserDto);
}
/**
 * Sanitize array of users to provider profile DTOs
 */
function toProviderProfileDtoArray(users) {
    return (0, base_sanitizer_1.sanitizeArray)(users, toProviderProfileDto);
}
/**
 * Sanitize array of users to provider with contact DTOs
 */
function toProviderWithContactDtoArray(users) {
    return (0, base_sanitizer_1.sanitizeArray)(users, toProviderWithContactDto);
}
