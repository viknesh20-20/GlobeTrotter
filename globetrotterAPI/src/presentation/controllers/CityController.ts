import { Request, Response, NextFunction } from 'express';
import { CityService } from '../../application/use-cases/CityService.js';
import { AuthRequest } from '../middleware/auth.js';

export class CityController {
  constructor(private cityService: CityService) {}

  getAllCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        region_id: req.query.region_id as string,
        search: req.query.search as string,
        min_rating: req.query.min_rating ? parseFloat(req.query.min_rating as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      const cities = await this.cityService.getAllCities(filters);
      res.json(cities);
    } catch (error) {
      next(error);
    }
  };

  getCityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const city = await this.cityService.getCityById(req.params.id);
      if (!city) {
        res.status(404).json({ error: 'City not found' });
        return;
      }
      res.json(city);
    } catch (error) {
      next(error);
    }
  };

  getPopularCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const cities = await this.cityService.getPopularCities(limit);
      res.json(cities);
    } catch (error) {
      next(error);
    }
  };

  getAllRegions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const regions = await this.cityService.getAllRegions();
      res.json(regions);
    } catch (error) {
      next(error);
    }
  };

  createCity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const city = await this.cityService.createCity(req.body);
      res.status(201).json(city);
    } catch (error) {
      next(error);
    }
  };

  updateCity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const city = await this.cityService.updateCity(req.params.id, req.body);
      if (!city) {
        res.status(404).json({ error: 'City not found' });
        return;
      }
      res.json(city);
    } catch (error) {
      next(error);
    }
  };

  deleteCity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cityService.deleteCity(req.params.id);
      res.json({ message: 'City deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
