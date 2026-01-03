// Trip Types - matches database schema
export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed';

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  budget?: number;
  status: TripStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TripCity {
  id: string;
  name: string;
  country: string;
  image_url?: string;
  order: number;
}

export interface TripWithCities extends Trip {
  cities: TripCity[];
}

// Create/Update DTOs
export interface CreateTripDTO {
  name: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status?: TripStatus;
  notes?: string;
  city_ids?: string[];
}

export interface UpdateTripDTO {
  name?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: TripStatus;
  notes?: string;
  city_ids?: string[];
}

// Filters
export interface TripFilters {
  status?: TripStatus;
  limit?: number;
  offset?: number;
}
