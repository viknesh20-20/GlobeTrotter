import { User, CreateUserDTO, UpdateUserDTO, UserPreferences, UpdateUserPreferencesDTO, UserWithPreferences } from '../entities/User.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  
  // Preferences
  getPreferences(userId: string): Promise<UserPreferences | null>;
  updatePreferences(userId: string, data: UpdateUserPreferencesDTO): Promise<UserPreferences | null>;
  
  // Saved destinations
  getSavedDestinations(userId: string): Promise<string[]>;
  saveDestination(userId: string, cityId: string): Promise<boolean>;
  removeSavedDestination(userId: string, cityId: string): Promise<boolean>;
  
  // With full details
  findByIdWithDetails(id: string): Promise<UserWithPreferences | null>;
  
  // Count
  count(): Promise<number>;
}
