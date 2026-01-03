import { Response, NextFunction } from 'express';
import { UserService } from '../../application/use-cases/UserService.js';
import { AuthRequest } from '../middleware/auth.js';

export class UserController {
  constructor(private userService: UserService) {}

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await this.userService.getUserWithDetails(req.user.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await this.userService.updateUser(req.user.userId, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const preferences = await this.userService.getPreferences(req.user.userId);
      res.json(preferences);
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const preferences = await this.userService.updatePreferences(req.user.userId, req.body);
      res.json(preferences);
    } catch (error) {
      next(error);
    }
  };

  getSavedDestinations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const destinations = await this.userService.getSavedDestinations(req.user.userId);
      res.json(destinations);
    } catch (error) {
      next(error);
    }
  };

  saveDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { cityId } = req.body;
      await this.userService.saveDestination(req.user.userId, cityId);
      res.json({ message: 'Destination saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  removeSavedDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { cityId } = req.params;
      await this.userService.removeSavedDestination(req.user.userId, cityId);
      res.json({ message: 'Destination removed successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Admin only
  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await this.userService.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
