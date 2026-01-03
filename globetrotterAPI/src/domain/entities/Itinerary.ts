// Itinerary Types - matches database schema
export interface ScheduledActivity {
  id: string;
  activity_id: string;
  activity_name?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
}

export interface ItineraryDay {
  id: string;
  date: Date;
  notes?: string;
  activities: ScheduledActivity[];
}

export interface ItineraryStop {
  id: string;
  city_id: string;
  city_name?: string;
  country?: string;
  image_url?: string;
  start_date: Date;
  end_date: Date;
  accommodation?: string;
  notes?: string;
  order: number;
  days: ItineraryDay[];
}

export interface Itinerary {
  id: string;
  trip_id: string;
  created_at: Date;
  updated_at: Date;
  stops?: ItineraryStop[];
}

// Create/Update DTOs
export interface CreateScheduledActivityDTO {
  activity_id: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  estimated_cost?: number;
}

export interface CreateItineraryDayDTO {
  date: string;
  notes?: string;
  activities?: CreateScheduledActivityDTO[];
}

export interface CreateItineraryStopDTO {
  city_id: string;
  start_date: string;
  end_date: string;
  accommodation?: string;
  notes?: string;
  order: number;
  days?: CreateItineraryDayDTO[];
}

export interface CreateItineraryDTO {
  trip_id: string;
  stops?: CreateItineraryStopDTO[];
}

export interface UpdateItineraryDTO {
  stops?: CreateItineraryStopDTO[];
}
