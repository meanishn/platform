/**
 * Request Controller - Assignment-Based Model
 * 
 * Handles HTTP requests for service request operations
 * Based on Technical Spec v1.1 - No proposals, automatic assignment
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { requestService } from '../services/requestService';

export class RequestController {
  /**
   * Create a new service request
   * POST /api/service-requests
   */
  createRequest = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const {
        categoryId,
        tierId,
        title,
        description,
        address,
        latitude,
        longitude,
        preferredDate,
        urgency,
        estimatedHours,
        images
      } = req.body;

      const request = await requestService.createRequest({
        userId,
        categoryId,
        tierId,
        title,
        description,
        address,
        latitude,
        longitude,
        preferredDate,
        urgency,
        estimatedHours,
        images
      });

      res.status(201).json({
        success: true,
        message: 'Service request created successfully. Notifying qualified providers...',
        data: request
      });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Request creation failed'
      });
    }
  };

  /**
   * Customer confirms a provider among acceptances
   * POST /api/service-requests/:id/confirm
   */
  confirmProvider = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const { providerId } = req.body;

      if (!providerId) {
        return res.status(400).json({ success: false, message: 'providerId is required' });
      }

      const updated = await requestService.confirmProvider(parseInt(id), userId, parseInt(providerId));

      res.json({
        success: true,
        message: 'Provider confirmed successfully',
        data: updated
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Confirmation failed'
      });
    }
  };

  /**
   * Provider accepts an assignment
   * PATCH /api/assignments/:notificationId/accept
   */
  acceptAssignment = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { requestId } = req.body;

      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
      }

      const request = await requestService.acceptAssignment(
        parseInt(requestId),
        providerId
      );

      res.json({
        success: true,
        message: 'Assignment accepted successfully',
        data: request
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assignment acceptance failed';
      const status = message.includes('no longer available') || message.includes('not found') ? 409 : 400;
      
      res.status(status).json({
        success: false,
        message
      });
    }
  };

  /**
   * Provider declines an assignment
   * PATCH /api/assignments/:notificationId/decline
   */
  declineAssignment = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { requestId, reason } = req.body;

      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
      }

      await requestService.declineAssignment(
        parseInt(requestId),
        providerId,
        reason
      );

      res.json({
        success: true,
        message: 'Assignment declined'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Assignment decline failed'
      });
    }
  };

  /**
   * Start a job
   * PATCH /api/service-requests/:id/start
   */
  startJob = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { id } = req.params;

      const request = await requestService.startJob(parseInt(id), providerId);

      res.json({
        success: true,
        message: 'Job started successfully',
        data: request
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Job start failed'
      });
    }
  };

  /**
   * Complete a job
   * PATCH /api/service-requests/:id/complete
   */
  completeJob = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { id } = req.params;

      const request = await requestService.completeJob(parseInt(id), providerId);

      res.json({
        success: true,
        message: 'Job completed successfully',
        data: request
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Job completion failed'
      });
    }
  };

  /**
   * Cancel a request
   * PATCH /api/service-requests/:id/cancel
   */
  cancelRequest = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const request = await requestService.cancelRequest(
        parseInt(id),
        userId,
        reason
      );

      res.json({
        success: true,
        message: 'Request cancelled successfully',
        data: request
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Cancellation failed'
      });
    }
  };

  /**
   * Get user's requests (for customers)
   * GET /api/service-requests
   */
  getUserRequests = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { status } = req.query;

      const requests = await requestService.getUserRequests(
        userId,
        status as any
      );

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get requests'
      });
    }
  };

  /**
   * Get provider's assignments
   * GET /api/providers/assignments
   */
  getProviderAssignments = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { status } = req.query;

      const assignments = await requestService.getProviderAssignments(
        providerId,
        status as any
      );

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get assignments'
      });
    }
  };

  /**
   * Get request details
   * GET /api/service-requests/:id
   */
  getRequest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const request = await requestService.getRequestDetails(parseInt(id), userId);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      const status = error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get request'
      });
    }
  };

  /**
   * Get assigned provider for a request
   * GET /api/requests/:requestId/assigned-provider
   */
  getAssignedProvider = async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const provider = await requestService.getAssignedProvider(parseInt(requestId));

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'No provider assigned yet'
        });
      }

      res.json({
        success: true,
        data: provider
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get provider'
      });
    }
  };

  /**
   * Get accepted providers for a request (customer only)
   * GET /api/service-requests/:id/accepted-providers
   */
  getAcceptedProviders = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const result = await requestService.getAcceptedProvidersForCustomer(parseInt(id), userId);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get accepted providers';
      const status = message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, message });
    }
  };
}

export const requestController = new RequestController();
