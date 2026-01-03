// User Types - matches database schema (snake_case)
export type UserRole = 'admin' | 'traveler' | 'agency';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  user_id: string;
  interests: string[];
  budget_range: string;
  travel_style: string[];
  accommodation_preference: string[];
}

export interface UserWithPreferences extends Omit<User, 'password_hash'> {
  interests?: string[];
  budget_range?: string;
  travel_style?: string[];
  accommodation_preference?: string[];
  saved_destinations?: string[];
}

// Create/Update DTOs
export interface CreateUserDTO {
  email: string;
  password_hash: string;
  full_name: string;
  role?: UserRole;
  avatar_url?: string;
}

export interface UpdateUserDTO {
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
}

export interface UpdateUserPreferencesDTO {
  interests?: string[];
  budget_range?: string;
  travel_style?: string[];
  accommodation_preference?: string[];
}
