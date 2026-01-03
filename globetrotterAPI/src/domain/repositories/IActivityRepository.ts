import { Activity, CreateActivityDTO, UpdateActivityDTO, ActivityFilters, ActivityCategory } from '../entities/Activity.js';

export interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  findAll(filters?: ActivityFilters): Promise<Activity[]>;
  findByCityId(cityId: string): Promise<Activity[]>;
  create(data: CreateActivityDTO): Promise<Activity>;
  update(id: string, data: UpdateActivityDTO): Promise<Activity | null>;
  delete(id: string): Promise<boolean>;
  
  // Categories
  getAllCategories(): Promise<ActivityCategory[]>;
  
  // Count
  count(): Promise<number>;
}
