import { City, CreateCityDTO, UpdateCityDTO, CityFilters, Region } from '../entities/City.js';

export interface ICityRepository {
  findById(id: string): Promise<City | null>;
  findAll(filters?: CityFilters): Promise<City[]>;
  create(data: CreateCityDTO): Promise<City>;
  update(id: string, data: UpdateCityDTO): Promise<City | null>;
  delete(id: string): Promise<boolean>;
  
  // Regions
  getAllRegions(): Promise<Region[]>;
  
  // Count
  count(): Promise<number>;
  
  // Popular cities
  getPopularCities(limit?: number): Promise<City[]>;
}
