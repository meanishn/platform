import { Request, Response } from 'express';
import ServiceCategory from '../models/ServiceCategory';
import ServiceTier from '../models/ServiceTier';

export class ServiceController {
  /**
   * Get all service categories
   */
  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await ServiceCategory.query()
        .where('is_active', true)
        .withGraphFetched('tiers')
        .orderBy('name');

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get categories'
      });
    }
  };

  /**
   * Get service tiers for a category
   */
  getCategoryTiers = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

      const tiers = await ServiceTier.query()
        .where('category_id', categoryId)
        .where('is_active', true)
        .orderBy('base_hourly_rate');

      res.json({
        success: true,
        data: tiers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get tiers'
      });
    }
  };

  /**
   * Create service category (admin only)
   */
  createCategory = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { name, description, icon } = req.body;

      const category = await ServiceCategory.query().insertAndFetch({
        name,
        description,
        icon,
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Category creation failed'
      });
    }
  };

  /**
   * Create service tier (admin only)
   */
  createTier = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { name, description, baseHourlyRate, categoryId } = req.body;

      const tier = await ServiceTier.query().insertAndFetch({
        name,
        description,
        base_hourly_rate: baseHourlyRate,
        category_id: categoryId,
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'Tier created successfully',
        data: tier
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Tier creation failed'
      });
    }
  };

  /**
   * Update category (admin only)
   */
  updateCategory = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { categoryId } = req.params;
      const { name, description, icon, isActive } = req.body;

      const category = await ServiceCategory.query().patchAndFetchById(categoryId, {
        name,
        description,
        icon,
        is_active: isActive
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Category update failed'
      });
    }
  };

  /**
   * Update tier (admin only)
   */
  updateTier = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { tierId } = req.params;
      const { name, description, baseHourlyRate, isActive } = req.body;

      const tier = await ServiceTier.query().patchAndFetchById(tierId, {
        name,
        description,
        base_hourly_rate: baseHourlyRate,
        is_active: isActive
      });

      res.json({
        success: true,
        message: 'Tier updated successfully',
        data: tier
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Tier update failed'
      });
    }
  };
}
