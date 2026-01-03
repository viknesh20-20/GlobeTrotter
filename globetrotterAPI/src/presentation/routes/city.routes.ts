import { Router } from 'express';
import { CityController } from '../controllers/CityController.js';
import { authenticate, authorize } from '../middleware/index.js';
import { CityService } from '../../application/use-cases/CityService.js';
import { CityRepository } from '../../infrastructure/repositories/CityRepository.js';

const router = Router();

const cityRepository = new CityRepository();
const cityService = new CityService(cityRepository);
const cityController = new CityController(cityService);

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/', cityController.getAllCities);

/**
 * @swagger
 * /api/cities/popular:
 *   get:
 *     summary: Get popular cities
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of cities to return
 *     responses:
 *       200:
 *         description: List of popular cities
 */
router.get('/popular', cityController.getPopularCities);

/**
 * @swagger
 * /api/cities/regions:
 *   get:
 *     summary: Get all regions
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: List of all regions
 */
router.get('/regions', cityController.getAllRegions);

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: City details
 *       404:
 *         description: City not found
 */
router.get('/:id', cityController.getCityById);

/**
 * @swagger
 * /api/cities:
 *   post:
 *     summary: Create a new city (admin only)
 *     tags: [Cities]
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
 *               - country
 *               - region
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: City created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', authenticate, authorize('admin'), cityController.createCity);

/**
 * @swagger
 * /api/cities/{id}:
 *   put:
 *     summary: Update a city (admin only)
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: City updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id', authenticate, authorize('admin'), cityController.updateCity);

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     summary: Delete a city (admin only)
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: City deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/:id', authenticate, authorize('admin'), cityController.deleteCity);

export default router;
