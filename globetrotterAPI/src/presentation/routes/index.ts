import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import cityRoutes from './city.routes.js';
import activityRoutes from './activity.routes.js';
import tripRoutes from './trip.routes.js';
import itineraryRoutes from './itinerary.routes.js';
import communityRoutes from './community.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/activities', activityRoutes);
router.use('/trips', tripRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/community', communityRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
