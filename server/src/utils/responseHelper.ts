/**
 * Response Helper Utilities
 * Provides consistent response formatting across all endpoints
 */

import { Response } from 'express';
import { ApiResponse, ValidationError } from '../shared/types/responses';

export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send success response with 201 Created status
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return ResponseHelper.success(res, data, message, 201);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode = 400,
    errors?: ValidationError[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: ValidationError[],
    message = 'Validation failed'
  ): Response {
    return ResponseHelper.error(res, message, 400, errors);
  }

  /**
   * Send unauthorized error
   */
  static unauthorized(res: Response, message = 'Authentication required'): Response {
    return ResponseHelper.error(res, message, 401);
  }

  /**
   * Send forbidden error
   */
  static forbidden(res: Response, message = 'Access denied'): Response {
    return ResponseHelper.error(res, message, 403);
  }

  /**
   * Send not found error
   */
  static notFound(res: Response, message = 'Resource not found'): Response {
    return ResponseHelper.error(res, message, 404);
  }

  /**
   * Send conflict error
   */
  static conflict(res: Response, message = 'Resource conflict'): Response {
    return ResponseHelper.error(res, message, 409);
  }

  /**
   * Send internal server error
   */
  static serverError(res: Response, message = 'Internal server error'): Response {
    return ResponseHelper.error(res, message, 500);
  }

  /**
   * Convert express-validator errors to ValidationError format
   */
  static formatValidationErrors(errors: any[]): ValidationError[] {
    return errors.map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
  }
}

