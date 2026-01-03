// City Types - matches database schema
export interface Region {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region_id: string;
  region_name?: string;
  description?: string;
  image_url?: string;
  best_time_to_visit?: string;
  average_cost_per_day?: number;
  rating: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CityWithRegion extends City {
  region?: Region;
}

// Create/Update DTOs
export interface CreateCityDTO {
  name: string;
  country: string;
  region_id: string;
  description?: string;
  image_url?: string;
  best_time_to_visit?: string;
  average_cost_per_day?: number;
  rating?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface UpdateCityDTO {
  name?: string;
  country?: string;
  region_id?: string;
  description?: string;
  image_url?: string;
  best_time_to_visit?: string;
  average_cost_per_day?: number;
  rating?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
}

// Search/Filter DTOs
export interface CityFilters {
  region_id?: string;
  search?: string;
  min_rating?: number;
  limit?: number;
  offset?: number;
}
