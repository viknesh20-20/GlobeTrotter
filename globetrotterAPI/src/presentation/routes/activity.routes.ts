import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController.js';
import { authenticate, authorize } from '../middleware/index.js';
import { ActivityService } from '../../application/use-cases/ActivityService.js';
import { ActivityRepository } from '../../infrastructure/repositories/ActivityRepository.js';

const router = Router();

const activityRepository = new ActivityRepository();
const activityService = new ActivityService(activityRepository);
const activityController = new ActivityController(activityService);

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: priceRange
 *         schema:
 *           type: string
 *         description: Filter by price range
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/', activityController.getAllActivities);

/**
 * @swagger
 * /api/activities/categories:
 *   get:
 *     summary: Get all activity categories
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of activity categories
 */
router.get('/categories', activityController.getAllCategories);

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The activity ID
 *     responses:
 *       200:
 *         description: Activity details
 *       404:
 *         description: Activity not found
 */
router.get('/:id', activityController.getActivityById);

/**
 * @swagger
 * /api/activities/city/{cityId}:
 *   get:
 *     summary: Get activities by city
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: List of activities in the city
 *       404:
 *         description: City not found
 */
router.get('/city/:cityId', activityController.getActivitiesByCity);

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new activity (admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city_id
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               city_id:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration_hours:
 *                 type: number
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', authenticate, authorize('admin'), activityController.createActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update an activity (admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The activity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration_hours:
 *                 type: number
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id', authenticate, authorize('admin'), activityController.updateActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete an activity (admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The activity ID
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/:id', authenticate, authorize('admin'), activityController.deleteActivity);

export default router;
