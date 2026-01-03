import { Trip, TripWithCities, CreateTripDTO, UpdateTripDTO, TripFilters } from '../entities/Trip.js';

export interface ITripRepository {
  findById(id: string): Promise<TripWithCities | null>;
  findByUserId(userId: string, filters?: TripFilters): Promise<TripWithCities[]>;
  findAll(filters?: TripFilters): Promise<TripWithCities[]>;
  create(userId: string, data: CreateTripDTO): Promise<TripWithCities>;
  update(id: string, data: UpdateTripDTO): Promise<TripWithCities | null>;
  delete(id: string): Promise<boolean>;
  
  // Status update
  updateStatus(id: string): Promise<Trip | null>;
  
  // Count
  count(): Promise<number>;
  countByUserId(userId: string): Promise<number>;
  countByStatus(status: string): Promise<number>;
}
