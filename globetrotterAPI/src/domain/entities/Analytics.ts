// Analytics Types - matches database schema
export interface AnalyticsData {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  totalPosts: number;
  activeTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  recentUsers: {
    id: string;
    full_name: string;
    email: string;
    created_at: Date;
  }[];
  recentTrips: {
    id: string;
    name: string;
    user_name: string;
    start_date: Date;
    status: string;
  }[];
  popularCities: {
    id: string;
    name: string;
    country: string;
    trip_count: number;
  }[];
}
