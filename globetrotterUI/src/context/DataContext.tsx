import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Import mock data as fallback
import citiesData from '../data/cities.json';
import tripsData from '../data/trips.json';
import activitiesData from '../data/activities.json';
import communityData from '../data/community.json';

interface DataContextType {
  // Cities
  cities: any[];
  regions: any[];
  featuredDestinations: any[];
  getCityById: (id: string) => any | undefined;
  loadCities: (params?: any) => Promise<void>;

  // Activities
  activities: any[];
  activityCategories: any[];
  getActivitiesByCity: (cityId: string) => any[];
  loadActivities: (params?: any) => Promise<void>;

  // Trips (user-specific)
  trips: any[];
  getTripById: (id: string) => any | undefined;
  loadTrips: () => Promise<void>;
  createTrip: (data: any) => Promise<any>;
  updateTrip: (id: string, data: any) => Promise<any>;
  deleteTrip: (id: string) => Promise<boolean>;

  // Itineraries
  getItineraryByTripId: (tripId: string) => Promise<any>;

  // Community
  communityPosts: any[];
  loadCommunityPosts: (params?: any) => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Mode
  useApi: boolean;
  setUseApi: (value: boolean) => void;
}

const DataContext = createContext<DataContextType | null>(null);

// Check if API is available
async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [useApiMode, setUseApiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [cities, setCities] = useState<any[]>(citiesData.cities || []);
  const [regions, setRegions] = useState<any[]>(citiesData.regions || []);
  const [featuredDestinations, setFeaturedDestinations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>(activitiesData.activities || []);
  const [activityCategories, setActivityCategories] = useState<any[]>(activitiesData.categories || []);
  const [trips, setTrips] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>(communityData.posts || []);

  // Check API availability on mount
  useEffect(() => {
    checkApiAvailability().then(available => {
      setUseApiMode(available);
      setIsLoading(false);
    });
  }, []);

  // Set API token when auth changes
  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  // Load cities
  const loadCities = useCallback(async (params?: any) => {
    if (!useApiMode) {
      let filtered = citiesData.cities || [];
      if (params?.region) {
        filtered = filtered.filter((c: any) => c.region === params.region);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter((c: any) =>
          c.name.toLowerCase().includes(search) ||
          c.country.toLowerCase().includes(search)
        );
      }
      setCities(filtered);
      return;
    }

    try {
      const response = await api.getCities(params);
      if (response.data) {
        setCities(response.data);
      }
    } catch (err) {
      setError('Failed to load cities');
    }
  }, [useApiMode]);

  // Load regions
  const loadRegions = useCallback(async () => {
    if (!useApiMode) {
      setRegions(citiesData.regions || []);
      return;
    }

    try {
      const response = await api.getRegions();
      if (response.data) {
        setRegions(response.data);
      }
    } catch (err) {
      setError('Failed to load regions');
    }
  }, [useApiMode]);

  // Load featured destinations
  const loadFeaturedDestinations = useCallback(async () => {
    if (!useApiMode) {
      // Use community.json featured destinations
      const featured = communityData.featuredDestinations || [];
      setFeaturedDestinations(featured);
      return;
    }

    try {
      const response = await api.getFeaturedDestinations();
      if (response.data) {
        setFeaturedDestinations(response.data);
      }
    } catch (err) {
      // Fallback to community.json
      setFeaturedDestinations(communityData.featuredDestinations || []);
      setError('Failed to load featured destinations');
    }
  }, [useApiMode]);

  // Load activities
  const loadActivities = useCallback(async (params?: any) => {
    if (!useApiMode) {
      let filtered = activitiesData.activities || [];
      if (params?.cityId) {
        filtered = filtered.filter((a: any) => a.cityId === params.cityId);
      }
      if (params?.category) {
        filtered = filtered.filter((a: any) => a.category === params.category);
      }
      setActivities(filtered);
      return;
    }

    try {
      const response = await api.getActivities(params);
      if (response.data) {
        setActivities(response.data);
      }
    } catch (err) {
      setError('Failed to load activities');
    }
  }, [useApiMode]);

  // Load activity categories
  const loadActivityCategories = useCallback(async () => {
    if (!useApiMode) {
      setActivityCategories(activitiesData.categories || []);
      return;
    }

    try {
      const response = await api.getActivityCategories();
      if (response.data) {
        setActivityCategories(response.data);
      }
    } catch (err) {
      setError('Failed to load activity categories');
    }
  }, [useApiMode]);

  // Load trips
  const loadTrips = useCallback(async () => {
    if (!useApiMode) {
      setTrips(tripsData.trips || []);
      return;
    }

    try {
      const response = await api.getMyTrips();
      if (response.data) {
        setTrips(response.data);
      }
    } catch (err) {
      setError('Failed to load trips');
    }
  }, [useApiMode]);

  // Create trip
  const createTrip = useCallback(async (data: any) => {
    const tripId = `trip-${Date.now()}`;

    if (!useApiMode) {
      const newTrip = { ...data, id: tripId };
      setTrips(prev => [...prev, newTrip]);
      // Also save to localStorage as backup
      const existingTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]');
      localStorage.setItem('globetrotter-trips', JSON.stringify([...existingTrips, newTrip]));
      return newTrip;
    }

    try {
      const response = await api.createTrip(data);
      if (response.data) {
        // Merge original data with API response to ensure all fields are preserved
        const mergedTrip = {
          ...data,
          ...response.data,
          id: response.data.id || tripId,
          cities: response.data.cities || data.cities || [],
          activities: response.data.activities || data.activities || [],
        };
        setTrips(prev => [...prev, mergedTrip]);
        // Also save to localStorage as backup for offline access
        const existingTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]');
        localStorage.setItem('globetrotter-trips', JSON.stringify([...existingTrips, mergedTrip]));
        return mergedTrip;
      }
      throw new Error(response.error || 'Failed to create trip');
    } catch (error) {
      // Fallback: if API fails, save locally
      const localTrip = { ...data, id: tripId };
      setTrips(prev => [...prev, localTrip]);
      const existingTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]');
      localStorage.setItem('globetrotter-trips', JSON.stringify([...existingTrips, localTrip]));
      return localTrip;
    }
  }, [useApiMode]);

  // Update trip
  const updateTrip = useCallback(async (id: string, data: any) => {
    if (!useApiMode) {
      setTrips(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
      return { ...trips.find(t => t.id === id), ...data };
    }

    const response = await api.updateTrip(id, data);
    if (response.data) {
      setTrips(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    }
    throw new Error(response.error || 'Failed to update trip');
  }, [useApiMode, trips]);

  // Delete trip
  const deleteTrip = useCallback(async (id: string) => {
    if (!useApiMode) {
      setTrips(prev => prev.filter(t => t.id !== id));
      return true;
    }

    const response = await api.deleteTrip(id);
    if (!response.error) {
      setTrips(prev => prev.filter(t => t.id !== id));
      return true;
    }
    throw new Error(response.error || 'Failed to delete trip');
  }, [useApiMode]);

  // Get itinerary by trip ID
  const getItineraryByTripId = useCallback(async (tripId: string) => {
    if (!useApiMode) {
      // Return mock itinerary structure
      return null;
    }

    const response = await api.getItineraryByTripId(tripId);
    return response.data || null;
  }, [useApiMode]);

  // Load community posts
  const loadCommunityPosts = useCallback(async (params?: any) => {
    if (!useApiMode) {
      setCommunityPosts(communityData.posts || []);
      return;
    }

    try {
      const response = await api.getPosts(params);
      if (response.data) {
        setCommunityPosts(response.data);
      }
    } catch (err) {
      setError('Failed to load community posts');
    }
  }, [useApiMode]);

  // Helper functions
  const getCityById = useCallback((id: string) => {
    return cities.find(c => c.id === id);
  }, [cities]);

  const getTripById = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  const getActivitiesByCity = useCallback((cityId: string) => {
    return activities.filter(a => a.cityId === cityId || a.city_id === cityId);
  }, [activities]);

  // Initial data load
  useEffect(() => {
    if (!isLoading) {
      loadRegions();
      loadFeaturedDestinations();
      loadActivityCategories();
      loadTrips();
    }
  }, [isLoading, loadRegions, loadFeaturedDestinations, loadActivityCategories, loadTrips]);

  return (
    <DataContext.Provider value={{
      cities,
      regions,
      featuredDestinations,
      getCityById,
      loadCities,
      activities,
      activityCategories,
      getActivitiesByCity,
      loadActivities,
      trips,
      getTripById,
      loadTrips,
      createTrip,
      updateTrip,
      deleteTrip,
      getItineraryByTripId,
      communityPosts,
      loadCommunityPosts,
      isLoading,
      error,
      useApi: useApiMode,
      setUseApi: setUseApiMode,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
