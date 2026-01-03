import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';
import { authenticate, authorize } from '../middleware/index.js';
import { AnalyticsService } from '../../application/use-cases/AnalyticsService.js';

const router = Router();

const analyticsService = new AnalyticsService();
const analyticsController = new AnalyticsController(analyticsService);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalTrips:
 *                   type: integer
 *                 totalCities:
 *                   type: integer
 *                 totalActivities:
 *                   type: integer
 *                 popularDestinations:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', authenticate, authorize('admin'), analyticsController.getDashboardAnalytics);

export default router;
