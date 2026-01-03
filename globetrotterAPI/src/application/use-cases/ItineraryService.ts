import { IItineraryRepository } from '../../domain/repositories/IItineraryRepository.js';
import { Itinerary, CreateItineraryDTO, UpdateItineraryDTO } from '../../domain/entities/Itinerary.js';

export class ItineraryService {
  constructor(private itineraryRepository: IItineraryRepository) {}

  async getItineraryById(id: string): Promise<Itinerary | null> {
    return await this.itineraryRepository.findById(id);
  }

  async getItineraryByTripId(tripId: string): Promise<Itinerary | null> {
    return await this.itineraryRepository.findByTripId(tripId);
  }

  async createItinerary(data: CreateItineraryDTO): Promise<Itinerary> {
    return await this.itineraryRepository.create(data);
  }

  async updateItinerary(id: string, data: UpdateItineraryDTO): Promise<Itinerary | null> {
    return await this.itineraryRepository.update(id, data);
  }

  async deleteItinerary(id: string): Promise<boolean> {
    return await this.itineraryRepository.delete(id);
  }

  async addStop(itineraryId: string, stopData: any): Promise<any> {
    return await this.itineraryRepository.addStop(itineraryId, stopData);
  }

  async updateStop(stopId: string, stopData: any): Promise<any> {
    return await this.itineraryRepository.updateStop(stopId, stopData);
  }

  async deleteStop(stopId: string): Promise<boolean> {
    return await this.itineraryRepository.deleteStop(stopId);
  }

  async addActivity(dayId: string, activityData: any): Promise<any> {
    return await this.itineraryRepository.addActivity(dayId, activityData);
  }

  async removeActivity(scheduledActivityId: string): Promise<boolean> {
    return await this.itineraryRepository.removeActivity(scheduledActivityId);
  }
}
