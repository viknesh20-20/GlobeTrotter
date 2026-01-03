// API Service - Handles all communication with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Request failed' };
      }

      return { data: toCamelCase(data) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
  }) {
    return this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Users
  async getProfile() {
    return this.request<any>('/users/me');
  }

  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async getPreferences() {
    return this.request<any>('/users/preferences');
  }

  async updatePreferences(data: any) {
    return this.request<any>('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async getSavedDestinations() {
    return this.request<string[]>('/users/saved-destinations');
  }

  async saveDestination(cityId: string) {
    return this.request<void>('/users/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ city_id: cityId }),
    });
  }

  async removeSavedDestination(cityId: string) {
    return this.request<void>(`/users/saved-destinations/${cityId}`, {
      method: 'DELETE',
    });
  }

  // Cities
  async getCities(params?: {
    region?: string;
    search?: string;
    minBudget?: number;
    maxBudget?: number;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key.replace(/([A-Z])/g, '_$1').toLowerCase(), String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<any[]>(`/cities${query ? `?${query}` : ''}`);
  }

  async getCityById(id: string) {
    return this.request<any>(`/cities/${id}`);
  }

  async getRegions() {
    return this.request<any[]>('/cities/regions');
  }

  async getFeaturedDestinations() {
    return this.request<any[]>('/community/featured');
  }

  // Activities
  async getActivities(params?: {
    cityId?: string;
    category?: string;
    search?: string;
    minCost?: number;
    maxCost?: number;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key.replace(/([A-Z])/g, '_$1').toLowerCase(), String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<any[]>(`/activities${query ? `?${query}` : ''}`);
  }

  async getActivityById(id: string) {
    return this.request<any>(`/activities/${id}`);
  }

  async getActivityCategories() {
    return this.request<any[]>('/activities/categories');
  }

  // Trips
  async getMyTrips(params?: { status?: string }) {
    const query = params?.status ? `?status=${params.status}` : '';
    return this.request<any[]>(`/trips/my-trips${query}`);
  }

  async getTripById(id: string) {
    return this.request<any>(`/trips/${id}`);
  }

  async createTrip(data: {
    name: string;
    startDate: string;
    endDate: string;
    budget?: number;
    notes?: string;
    cityIds?: string[];
  }) {
    return this.request<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async updateTrip(id: string, data: any) {
    return this.request<any>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async deleteTrip(id: string) {
    return this.request<void>(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Itineraries
  async getItineraryByTripId(tripId: string) {
    return this.request<any>(`/itineraries/trip/${tripId}`);
  }

  async createItinerary(data: { tripId: string; stops?: any[] }) {
    return this.request<any>('/itineraries', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async updateItinerary(id: string, data: any) {
    return this.request<any>(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async addItineraryStop(itineraryId: string, stopData: any) {
    return this.request<any>(`/itineraries/${itineraryId}/stops`, {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(stopData)),
    });
  }

  async updateItineraryStop(itineraryId: string, stopId: string, stopData: any) {
    return this.request<any>(`/itineraries/${itineraryId}/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(stopData)),
    });
  }

  async deleteItineraryStop(itineraryId: string, stopId: string) {
    return this.request<void>(`/itineraries/${itineraryId}/stops/${stopId}`, {
      method: 'DELETE',
    });
  }

  async addScheduledActivity(itineraryId: string, dayId: string, activityData: any) {
    return this.request<any>(`/itineraries/${itineraryId}/days/${dayId}/activities`, {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(activityData)),
    });
  }

  async removeScheduledActivity(itineraryId: string, scheduledActivityId: string) {
    return this.request<void>(`/itineraries/${itineraryId}/activities/${scheduledActivityId}`, {
      method: 'DELETE',
    });
  }

  // Community
  async getPosts(params?: {
    cityId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key.replace(/([A-Z])/g, '_$1').toLowerCase(), String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<any[]>(`/community/posts${query ? `?${query}` : ''}`);
  }

  async getPostById(id: string) {
    return this.request<any>(`/community/posts/${id}`);
  }

  async createPost(data: {
    title: string;
    content: string;
    cityId?: string;
    tags?: string[];
    images?: string[];
  }) {
    return this.request<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async updatePost(id: string, data: any) {
    return this.request<any>(`/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(data)),
    });
  }

  async deletePost(id: string) {
    return this.request<void>(`/community/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string) {
    return this.request<void>(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string) {
    return this.request<void>(`/community/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  async addComment(postId: string, content: string) {
    return this.request<any>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Analytics (Admin only)
  async getDashboardAnalytics() {
    return this.request<any>('/analytics/dashboard');
  }
}

export const api = new ApiService();
export default api;
