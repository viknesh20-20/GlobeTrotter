import { ITripRepository } from '../../domain/repositories/ITripRepository.js';
import { TripWithCities, CreateTripDTO, UpdateTripDTO, TripFilters } from '../../domain/entities/Trip.js';

export class TripService {
  constructor(private tripRepository: ITripRepository) {}

  async getTripById(id: string): Promise<TripWithCities | null> {
    return await this.tripRepository.findById(id);
  }

  async getUserTrips(userId: string, filters?: TripFilters): Promise<TripWithCities[]> {
    return await this.tripRepository.findByUserId(userId, filters);
  }

  async getAllTrips(filters?: TripFilters): Promise<TripWithCities[]> {
    return await this.tripRepository.findAll(filters);
  }

  async createTrip(userId: string, data: CreateTripDTO): Promise<TripWithCities> {
    return await this.tripRepository.create(userId, data);
  }

  async updateTrip(id: string, data: UpdateTripDTO): Promise<TripWithCities | null> {
    return await this.tripRepository.update(id, data);
  }

  async deleteTrip(id: string): Promise<boolean> {
    return await this.tripRepository.delete(id);
  }

  async updateTripStatus(id: string): Promise<any> {
    return await this.tripRepository.updateStatus(id);
  }

  async getTripCount(): Promise<number> {
    return await this.tripRepository.count();
  }

  async getUserTripCount(userId: string): Promise<number> {
    return await this.tripRepository.countByUserId(userId);
  }

  async getTripCountByStatus(status: string): Promise<number> {
    return await this.tripRepository.countByStatus(status);
  }
}
