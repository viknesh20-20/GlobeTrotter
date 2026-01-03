import { Itinerary, CreateItineraryDTO, UpdateItineraryDTO } from '../entities/Itinerary.js';

export interface IItineraryRepository {
  findById(id: string): Promise<Itinerary | null>;
  findByTripId(tripId: string): Promise<Itinerary | null>;
  create(data: CreateItineraryDTO): Promise<Itinerary>;
  update(id: string, data: UpdateItineraryDTO): Promise<Itinerary | null>;
  delete(id: string): Promise<boolean>;
  
  // Stops
  addStop(itineraryId: string, stopData: any): Promise<any>;
  updateStop(stopId: string, stopData: any): Promise<any>;
  deleteStop(stopId: string): Promise<boolean>;
  
  // Activities
  addActivity(dayId: string, activityData: any): Promise<any>;
  removeActivity(scheduledActivityId: string): Promise<boolean>;
}
