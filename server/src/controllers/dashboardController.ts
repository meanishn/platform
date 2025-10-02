/**
 * Dashboard Controller
 * 
 * Handles HTTP requests for dashboard statistics and activity feeds
 */

import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';

export class DashboardController {
  /**
   * Get customer dashboard statistics
   * GET /api/customers/dashboard/stats
   */
  getCustomerStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const stats = await dashboardService.getCustomerStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      });
    }
  };

  /**
   * Get customer activity feed
   * GET /api/customers/dashboard/activity
   */
  getCustomerActivity = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { limit } = req.query;

      const activity = await dashboardService.getCustomerActivity(
        userId,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get activity'
      });
    }
  };

  /**
   * Get provider dashboard statistics
   * GET /api/providers/dashboard/stats
   */
  getProviderStats = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const stats = await dashboardService.getProviderStats(providerId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      });
    }
  };

  /**
   * Get provider activity feed
   * GET /api/providers/dashboard/requests
   */
  getProviderActivity = async (req: Request, res: Response) => {
    try {
      const providerId = req.user?.id;
      if (!providerId || !req.user?.isApprovedProvider) {
        return res.status(403).json({
          success: false,
          message: 'Approved provider access required'
        });
      }

      const { limit } = req.query;

      const activity = await dashboardService.getProviderActivity(
        providerId,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get activity'
      });
    }
  };

  /**
   * Get admin dashboard statistics
   * GET /api/admin/dashboard/stats
   */
  getAdminStats = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const stats = await dashboardService.getAdminStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      });
    }
  };

  /**
   * Get admin activity feed
   * GET /api/admin/dashboard/activity
   */
  getAdminActivity = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { limit } = req.query;

      const activity = await dashboardService.getAdminActivity(
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get activity'
      });
    }
  };

  /**
   * Get dashboard stats based on user role (generic endpoint)
   * GET /api/dashboard/stats
   */
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      let stats;

      if (user.is_admin) {
        stats = await dashboardService.getAdminStats();
      } else if (user.isApprovedProvider) {
        stats = await dashboardService.getProviderStats(user.id);
      } else {
        stats = await dashboardService.getCustomerStats(user.id);
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get stats'
      });
    }
  };
}

export const dashboardController = new DashboardController();


