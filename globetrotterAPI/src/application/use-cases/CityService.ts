import { ICityRepository } from '../../domain/repositories/ICityRepository.js';
import { City, CreateCityDTO, UpdateCityDTO, CityFilters, Region } from '../../domain/entities/City.js';

export class CityService {
  constructor(private cityRepository: ICityRepository) {}

  async getCityById(id: string): Promise<City | null> {
    return await this.cityRepository.findById(id);
  }

  async getAllCities(filters?: CityFilters): Promise<City[]> {
    return await this.cityRepository.findAll(filters);
  }

  async createCity(data: CreateCityDTO): Promise<City> {
    return await this.cityRepository.create(data);
  }

  async updateCity(id: string, data: UpdateCityDTO): Promise<City | null> {
    return await this.cityRepository.update(id, data);
  }

  async deleteCity(id: string): Promise<boolean> {
    return await this.cityRepository.delete(id);
  }

  async getAllRegions(): Promise<Region[]> {
    return await this.cityRepository.getAllRegions();
  }

  async getPopularCities(limit?: number): Promise<City[]> {
    return await this.cityRepository.getPopularCities(limit);
  }

  async getCityCount(): Promise<number> {
    return await this.cityRepository.count();
  }
}
