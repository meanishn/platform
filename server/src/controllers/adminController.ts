/**
 * Admin Controller
 * 
 * Handles HTTP requests for administrative functions
 */

import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { validationResult } from 'express-validator';

export class AdminController {
  /**
   * Get list of users
   * GET /api/admin/users
   */
  getUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { role, status, searchQuery, limit, offset } = req.query;

      const result = await adminService.getUsers({
        role: role as any,
        status: status as any,
        searchQuery: searchQuery as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get users'
      });
    }
  };

  /**
   * Get provider details
   * GET /api/admin/providers/:id
   */
  getProviderDetails = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;

      const provider = await adminService.getProviderDetails(parseInt(id));

      if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider not found' });
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
   * Get pending provider applications
   * GET /api/admin/providers/pending
   */
  getPendingProviders = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const providers = await adminService.getPendingProviders();

      res.json({
        success: true,
        data: providers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get pending providers'
      });
    }
  };

  /**
   * Approve provider application
   * PATCH /api/admin/providers/:id/approve
   */
  approveProvider = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const { qualifiedCategories } = req.body;
      const adminId = req.user.id;

      const provider = await adminService.approveProvider({
        providerId: parseInt(id),
        adminId,
        qualifiedCategories
      });

      res.json({
        success: true,
        message: 'Provider approved successfully',
        data: provider
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Provider approval failed'
      });
    }
  };

  /**
   * Reject provider application
   * PATCH /api/admin/providers/:id/reject
   */
  rejectProvider = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const provider = await adminService.rejectProvider(
        parseInt(id),
        adminId,
        reason
      );

      res.json({
        success: true,
        message: 'Provider application rejected',
        data: provider
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Provider rejection failed'
      });
    }
  };

  /**
   * Suspend provider
   * PATCH /api/admin/providers/:id/suspend
   */
  suspendProvider = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const provider = await adminService.suspendProvider(
        parseInt(id),
        adminId,
        reason
      );

      res.json({
        success: true,
        message: 'Provider suspended successfully',
        data: provider
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Provider suspension failed'
      });
    }
  };

  /**
   * Reactivate suspended provider
   * PATCH /api/admin/providers/:id/reactivate
   */
  reactivateProvider = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const adminId = req.user.id;

      const provider = await adminService.reactivateProvider(parseInt(id), adminId);

      res.json({
        success: true,
        message: 'Provider reactivated successfully',
        data: provider
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Provider reactivation failed'
      });
    }
  };

  /**
   * Update user profile
   * PATCH /api/admin/users/:id
   */
  updateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const updates = req.body;

      const user = await adminService.updateUserProfile(parseInt(id), updates);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'User update failed'
      });
    }
  };

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const adminId = req.user.id;

      await adminService.deleteUser(parseInt(id), adminId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'User deletion failed'
      });
    }
  };

  /**
   * Get platform analytics
   * GET /api/admin/analytics
   */
  getAnalytics = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { days } = req.query;

      const analytics = await adminService.getAnalytics(
        days ? parseInt(days as string) : undefined
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get analytics'
      });
    }
  };

  /**
   * Get eligible providers for a service request (debugging/admin view)
   * GET /api/admin/requests/:id/eligible-providers
   */
  getEligibleProviders = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;

      // Import requestService here to avoid circular dependencies
      const { requestService } = await import('../services/requestService');
      const eligibleProviders = await requestService.getEligibleProviders(parseInt(id));

      res.json({
        success: true,
        data: eligibleProviders
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get eligible providers'
      });
    }
  };
}

export const adminController = new AdminController();


