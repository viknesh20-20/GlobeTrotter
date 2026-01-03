import { Router } from 'express';
import { TripController } from '../controllers/TripController.js';
import { authenticate, authorize } from '../middleware/index.js';
import { TripService } from '../../application/use-cases/TripService.js';
import { TripRepository } from '../../infrastructure/repositories/TripRepository.js';

const router = Router();

const tripRepository = new TripRepository();
const tripService = new TripService(tripRepository);
const tripController = new TripController(tripService);

/**
 * @swagger
 * /api/trips/my-trips:
 *   get:
 *     summary: Get current user's trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's trips
 *       401:
 *         description: Unauthorized
 */
router.get('/my-trips', authenticate, tripController.getUserTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.get('/:id', authenticate, tripController.getTripById);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
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
 *               - start_date
 *               - end_date
 *             properties:
 *               name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               destination_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               budget:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, tripController.createTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [planning, ongoing, completed, cancelled]
 *               budget:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.put('/:id', authenticate, tripController.updateTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.delete('/:id', authenticate, tripController.deleteTrip);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips (admin only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all trips
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authenticate, authorize('admin'), tripController.getAllTrips);

export default router;
