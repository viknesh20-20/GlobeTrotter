import { Response, NextFunction } from 'express';
import { TripService } from '../../application/use-cases/TripService.js';
import { TripFilters, TripStatus } from '../../domain/entities/Trip.js';
import { AuthRequest } from '../middleware/auth.js';

export class TripController {
  constructor(private tripService: TripService) {}

  getUserTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const filters: TripFilters = {
        status: req.query.status as TripStatus | undefined
      };
      const trips = await this.tripService.getUserTrips(req.user.userId, filters);
      res.json(trips);
    } catch (error) {
      next(error);
    }
  };

  getTripById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trip = await this.tripService.getTripById(req.params.id);
      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      // Check ownership (unless admin)
      if (req.user && req.user.role !== 'admin' && trip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      res.json(trip);
    } catch (error) {
      next(error);
    }
  };

  createTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const trip = await this.tripService.createTrip(req.user.userId, req.body);
      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  };

  updateTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingTrip = await this.tripService.getTripById(req.params.id);
      if (!existingTrip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingTrip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const trip = await this.tripService.updateTrip(req.params.id, req.body);
      res.json(trip);
    } catch (error) {
      next(error);
    }
  };

  deleteTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingTrip = await this.tripService.getTripById(req.params.id);
      if (!existingTrip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingTrip.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await this.tripService.deleteTrip(req.params.id);
      res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Admin only
  getAllTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: TripFilters = {
        status: req.query.status as TripStatus | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      const trips = await this.tripService.getAllTrips(filters);
      res.json(trips);
    } catch (error) {
      next(error);
    }
  };
}
