import { Request, Response } from 'express';
import ServiceCategory from '../models/ServiceCategory';
import ServiceTier from '../models/ServiceTier';
import { 
  toServiceCategoryDto,
  toServiceCategoryDtoArray,
  toServiceTierDto,
  toServiceTierDtoArray
} from '../sanitizers';

export class ServiceController {
  /**
   * Get all service categories
   * GET /api/service-categories/categories
   */
  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await ServiceCategory.query()
        .where('is_active', true)
        .withGraphFetched('tiers')
        .orderBy('name');

      // ✅ Sanitize to DTOs
      res.json({
        success: true,
        data: toServiceCategoryDtoArray(categories)
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
   * GET /api/service-categories/categories/:categoryId/tiers
   */
  getCategoryTiers = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      
      // Validate categoryId
      const catId = parseInt(categoryId);
      if (isNaN(catId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }

      const tiers = await ServiceTier.query()
        .where('category_id', catId)
        .where('is_active', true)
        .orderBy('base_hourly_rate');

      // ✅ Use sanitizer
      res.json({
        success: true,
        data: toServiceTierDtoArray(tiers)
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
   * POST /api/service-categories/categories
   */
  createCategory = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { name, description, icon } = req.body;
      
      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const category = await ServiceCategory.query().insertAndFetch({
        name: name.trim(),
        description: description?.trim(),
        icon,
        is_active: true
      });

      // ✅ Sanitize to DTO
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: toServiceCategoryDto(category)
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
   * POST /api/service-categories/tiers
   */
  createTier = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { name, description, baseHourlyRate, categoryId } = req.body;
      
      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tier name is required'
        });
      }
      
      if (!baseHourlyRate || typeof baseHourlyRate !== 'number' || baseHourlyRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid base hourly rate is required'
        });
      }
      
      if (!categoryId || isNaN(parseInt(categoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const tier = await ServiceTier.query().insertAndFetch({
        name: name.trim(),
        description: description?.trim(),
        base_hourly_rate: baseHourlyRate,
        category_id: parseInt(categoryId),
        is_active: true
      });

      // ✅ Sanitize to DTO
      res.status(201).json({
        success: true,
        message: 'Tier created successfully',
        data: toServiceTierDto(tier)
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
   * PATCH /api/service-categories/categories/:categoryId
   */
  updateCategory = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { categoryId } = req.params;
      const { name, description, icon, isActive } = req.body;
      
      // Validate categoryId
      const catId = parseInt(categoryId);
      if (isNaN(catId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
      
      // Build update object (only include provided fields)
      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description?.trim();
      if (icon !== undefined) updates.icon = icon;
      if (isActive !== undefined) updates.is_active = isActive;

      const category = await ServiceCategory.query().patchAndFetchById(catId, updates);

      // ✅ Sanitize to DTO
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: toServiceCategoryDto(category)
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
   * PATCH /api/service-categories/tiers/:tierId
   */
  updateTier = async (req: Request, res: Response) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { tierId } = req.params;
      const { name, description, baseHourlyRate, isActive } = req.body;
      
      // Validate tierId
      const tid = parseInt(tierId);
      if (isNaN(tid)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tier ID'
        });
      }
      
      // Build update object (only include provided fields)
      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description?.trim();
      if (baseHourlyRate !== undefined) {
        if (typeof baseHourlyRate !== 'number' || baseHourlyRate <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Valid base hourly rate is required'
          });
        }
        updates.base_hourly_rate = baseHourlyRate;
      }
      if (isActive !== undefined) updates.is_active = isActive;

      const tier = await ServiceTier.query().patchAndFetchById(tid, updates);

      // ✅ Sanitize to DTO
      res.json({
        success: true,
        message: 'Tier updated successfully',
        data: toServiceTierDto(tier)
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Tier update failed'
      });
    }
  };
}
