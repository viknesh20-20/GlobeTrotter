import { query } from '../../infrastructure/database/connection.js';

export interface AnalyticsData {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  totalCommunityPosts: number;
  activeTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  recentUsers: Array<{
    id: string;
    full_name: string;
    email: string;
    created_at: Date;
  }>;
  recentTrips: Array<{
    id: string;
    name: string;
    user_name: string;
    start_date: Date;
    status: string;
  }>;
  popularCities: Array<{
    id: string;
    name: string;
    country: string;
    trip_count: number;
  }>;
}

export class AnalyticsService {
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    // Get counts
    const [
      usersResult,
      tripsResult,
      citiesResult,
      activitiesResult,
      postsResult,
      activeTripsResult,
      upcomingTripsResult,
      completedTripsResult
    ] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) FROM users'),
      query<{ count: string }>('SELECT COUNT(*) FROM trips'),
      query<{ count: string }>('SELECT COUNT(*) FROM cities'),
      query<{ count: string }>('SELECT COUNT(*) FROM activities'),
      query<{ count: string }>('SELECT COUNT(*) FROM community_posts'),
      query<{ count: string }>('SELECT COUNT(*) FROM trips WHERE status = $1', ['active']),
      query<{ count: string }>('SELECT COUNT(*) FROM trips WHERE status = $1', ['upcoming']),
      query<{ count: string }>('SELECT COUNT(*) FROM trips WHERE status = $1', ['completed'])
    ]);

    // Get recent users
    const recentUsersResult = await query<{
      id: string;
      full_name: string;
      email: string;
      created_at: Date;
    }>(
      'SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Get recent trips
    const recentTripsResult = await query<{
      id: string;
      name: string;
      user_name: string;
      start_date: Date;
      status: string;
    }>(
      `SELECT t.id, t.name, u.full_name as user_name, t.start_date, t.status 
       FROM trips t 
       JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC 
       LIMIT 5`
    );

    // Get popular cities
    const popularCitiesResult = await query<{
      id: string;
      name: string;
      country: string;
      trip_count: string;
    }>(
      `SELECT c.id, c.name, c.country, COUNT(tc.trip_id) as trip_count 
       FROM cities c 
       LEFT JOIN trip_cities tc ON c.id = tc.city_id 
       GROUP BY c.id, c.name, c.country 
       ORDER BY trip_count DESC 
       LIMIT 10`
    );

    return {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalTrips: parseInt(tripsResult.rows[0].count),
      totalCities: parseInt(citiesResult.rows[0].count),
      totalActivities: parseInt(activitiesResult.rows[0].count),
      totalCommunityPosts: parseInt(postsResult.rows[0].count),
      activeTrips: parseInt(activeTripsResult.rows[0].count),
      upcomingTrips: parseInt(upcomingTripsResult.rows[0].count),
      completedTrips: parseInt(completedTripsResult.rows[0].count),
      recentUsers: recentUsersResult.rows,
      recentTrips: recentTripsResult.rows,
      popularCities: popularCitiesResult.rows.map(row => ({
        ...row,
        trip_count: parseInt(row.trip_count)
      }))
    };
  }
}
