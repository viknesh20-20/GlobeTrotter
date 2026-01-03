import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../../application/use-cases/AnalyticsService.js';
import { AuthRequest } from '../middleware/auth.js';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getDashboardAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.analyticsService.getDashboardAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };
}
