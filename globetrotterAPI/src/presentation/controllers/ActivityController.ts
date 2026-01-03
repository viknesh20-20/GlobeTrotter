import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../../application/use-cases/ActivityService.js';
import { AuthRequest } from '../middleware/auth.js';

export class ActivityController {
  constructor(private activityService: ActivityService) {}

  getAllActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        city_id: req.query.city_id as string,
        category_id: req.query.category_id as string,
        search: req.query.search as string,
        min_rating: req.query.min_rating ? parseFloat(req.query.min_rating as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        duration: req.query.duration as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      const activities = await this.activityService.getAllActivities(filters);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  };

  getActivityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.activityService.getActivityById(req.params.id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }
      res.json(activity);
    } catch (error) {
      next(error);
    }
  };

  getActivitiesByCity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activities = await this.activityService.getActivitiesByCity(req.params.cityId);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.activityService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  createActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.activityService.createActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  };

  updateActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.activityService.updateActivity(req.params.id, req.body);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }
      res.json(activity);
    } catch (error) {
      next(error);
    }
  };

  deleteActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.activityService.deleteActivity(req.params.id);
      res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
