// Activity Types - matches database schema
export interface ActivityCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Activity {
  id: string;
  name: string;
  city_id: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  description?: string;
  estimated_cost?: number;
  duration?: string;
  rating: number;
  image_url?: string;
  location?: string;
  best_time?: string;
  booking_required: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityWithDetails extends Activity {
  category?: ActivityCategory;
  city_name?: string;
}

// Create/Update DTOs
export interface CreateActivityDTO {
  name: string;
  city_id: string;
  category_id: string;
  description?: string;
  estimated_cost?: number;
  duration?: string;
  rating?: number;
  image_url?: string;
  location?: string;
  best_time?: string;
  booking_required?: boolean;
}

export interface UpdateActivityDTO {
  name?: string;
  city_id?: string;
  category_id?: string;
  description?: string;
  estimated_cost?: number;
  duration?: string;
  rating?: number;
  image_url?: string;
  location?: string;
  best_time?: string;
  booking_required?: boolean;
}

// Search/Filter DTOs
export interface ActivityFilters {
  city_id?: string;
  category_id?: string;
  search?: string;
  min_rating?: number;
  max_price?: number;
  duration?: string;
  limit?: number;
  offset?: number;
}
