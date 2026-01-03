import { Router } from 'express';
import { ItineraryController } from '../controllers/ItineraryController.js';
import { authenticate } from '../middleware/index.js';
import { ItineraryService } from '../../application/use-cases/ItineraryService.js';
import { TripService } from '../../application/use-cases/TripService.js';
import { ItineraryRepository } from '../../infrastructure/repositories/ItineraryRepository.js';
import { TripRepository } from '../../infrastructure/repositories/TripRepository.js';

const router = Router();

const itineraryRepository = new ItineraryRepository();
const tripRepository = new TripRepository();
const itineraryService = new ItineraryService(itineraryRepository);
const tripService = new TripService(tripRepository);
const itineraryController = new ItineraryController(itineraryService, tripService);

/**
 * @swagger
 * /api/itineraries/trip/{tripId}:
 *   get:
 *     summary: Get itinerary by trip ID
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     responses:
 *       200:
 *         description: Itinerary details with days and activities
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip or itinerary not found
 */
router.get('/trip/:tripId', authenticate, itineraryController.getItineraryByTripId);

/**
 * @swagger
 * /api/itineraries:
 *   post:
 *     summary: Create a new itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip_id
 *             properties:
 *               trip_id:
 *                 type: string
 *               days:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       201:
 *         description: Itinerary created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, itineraryController.createItinerary);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   put:
 *     summary: Update an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The itinerary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Itinerary updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Itinerary not found
 */
router.put('/:id', authenticate, itineraryController.updateItinerary);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   delete:
 *     summary: Delete an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Itinerary not found
 */
router.delete('/:id', authenticate, itineraryController.deleteItinerary);

/**
 * @swagger
 * /api/itineraries/day/{dayId}/activities:
 *   post:
 *     summary: Add activity to a day
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dayId
 *         required: true
 *         schema:
 *           type: string
 *         description: The day ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activity_id
 *             properties:
 *               activity_id:
 *                 type: string
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Day not found
 */
router.post('/day/:dayId/activities', authenticate, itineraryController.addActivity);

/**
 * @swagger
 * /api/itineraries/activities/{activityId}:
 *   delete:
 *     summary: Remove activity from itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The itinerary activity ID
 *     responses:
 *       200:
 *         description: Activity removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Activity not found
 */
router.delete('/activities/:activityId', authenticate, itineraryController.removeActivity);

export default router;
