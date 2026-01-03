import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User, UpdateUserDTO, UpdateUserPreferencesDTO, UserWithPreferences } from '../../domain/entities/User.js';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserWithDetails(id: string): Promise<UserWithPreferences | null> {
    return await this.userRepository.findByIdWithDetails(id);
  }

  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    return await this.userRepository.findAll(limit, offset);
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User | null> {
    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async updatePreferences(userId: string, data: UpdateUserPreferencesDTO): Promise<any> {
    return await this.userRepository.updatePreferences(userId, data);
  }

  async getPreferences(userId: string): Promise<any> {
    return await this.userRepository.getPreferences(userId);
  }

  async getSavedDestinations(userId: string): Promise<string[]> {
    return await this.userRepository.getSavedDestinations(userId);
  }

  async saveDestination(userId: string, cityId: string): Promise<boolean> {
    return await this.userRepository.saveDestination(userId, cityId);
  }

  async removeSavedDestination(userId: string, cityId: string): Promise<boolean> {
    return await this.userRepository.removeSavedDestination(userId, cityId);
  }

  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }
}
