import { Response, NextFunction } from 'express';
import { ItineraryService } from '../../application/use-cases/ItineraryService.js';
import { TripService } from '../../application/use-cases/TripService.js';
import { AuthRequest } from '../middleware/auth.js';

export class ItineraryController {
  constructor(
    private itineraryService: ItineraryService,
    private tripService: TripService
  ) {}

  getItineraryByTripId = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check trip ownership
      const trip = await this.tripService.getTripById(req.params.tripId);
      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      if (req.user && req.user.role !== 'admin' && trip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const itinerary = await this.itineraryService.getItineraryByTripId(req.params.tripId);
      res.json(itinerary);
    } catch (error) {
      next(error);
    }
  };

  createItinerary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check trip ownership
      const trip = await this.tripService.getTripById(req.body.trip_id);
      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      if (req.user.role !== 'admin' && trip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const itinerary = await this.itineraryService.createItinerary(req.body);
      res.status(201).json(itinerary);
    } catch (error) {
      next(error);
    }
  };

  updateItinerary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingItinerary = await this.itineraryService.getItineraryById(req.params.id);
      if (!existingItinerary) {
        res.status(404).json({ error: 'Itinerary not found' });
        return;
      }

      const trip = await this.tripService.getTripById(existingItinerary.trip_id);
      if (trip && req.user.role !== 'admin' && trip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const itinerary = await this.itineraryService.updateItinerary(req.params.id, req.body);
      res.json(itinerary);
    } catch (error) {
      next(error);
    }
  };

  deleteItinerary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingItinerary = await this.itineraryService.getItineraryById(req.params.id);
      if (!existingItinerary) {
        res.status(404).json({ error: 'Itinerary not found' });
        return;
      }

      const trip = await this.tripService.getTripById(existingItinerary.trip_id);
      if (trip && req.user.role !== 'admin' && trip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await this.itineraryService.deleteItinerary(req.params.id);
      res.json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  addActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.itineraryService.addActivity(req.params.dayId, req.body);
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  };

  removeActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.itineraryService.removeActivity(req.params.activityId);
      res.json({ message: 'Activity removed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
