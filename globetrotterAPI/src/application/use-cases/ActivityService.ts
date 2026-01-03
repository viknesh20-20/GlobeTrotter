import { IActivityRepository } from '../../domain/repositories/IActivityRepository.js';
import { Activity, CreateActivityDTO, UpdateActivityDTO, ActivityFilters, ActivityCategory } from '../../domain/entities/Activity.js';

export class ActivityService {
  constructor(private activityRepository: IActivityRepository) {}

  async getActivityById(id: string): Promise<Activity | null> {
    return await this.activityRepository.findById(id);
  }

  async getAllActivities(filters?: ActivityFilters): Promise<Activity[]> {
    return await this.activityRepository.findAll(filters);
  }

  async getActivitiesByCity(cityId: string): Promise<Activity[]> {
    return await this.activityRepository.findByCityId(cityId);
  }

  async createActivity(data: CreateActivityDTO): Promise<Activity> {
    return await this.activityRepository.create(data);
  }

  async updateActivity(id: string, data: UpdateActivityDTO): Promise<Activity | null> {
    return await this.activityRepository.update(id, data);
  }

  async deleteActivity(id: string): Promise<boolean> {
    return await this.activityRepository.delete(id);
  }

  async getAllCategories(): Promise<ActivityCategory[]> {
    return await this.activityRepository.getAllCategories();
  }

  async getActivityCount(): Promise<number> {
    return await this.activityRepository.count();
  }
}
