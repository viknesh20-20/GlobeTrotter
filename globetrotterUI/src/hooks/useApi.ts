import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  fetcher: () => Promise<{ data?: T; error?: string }>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate ?? true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await fetcher();
    if (result.error) {
      setState({ data: null, loading: false, error: result.error });
    } else {
      setState({ data: result.data ?? null, loading: false, error: null });
    }
    return result;
  }, [fetcher]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { ...state, refetch: execute };
}

// Cities hooks
export function useCities(params?: Parameters<typeof api.getCities>[0]) {
  return useApi(() => api.getCities(params));
}

export function useCity(id: string) {
  return useApi(() => api.getCityById(id));
}

export function useRegions() {
  return useApi(() => api.getRegions());
}

export function useFeaturedDestinations() {
  return useApi(() => api.getFeaturedDestinations());
}

// Activities hooks
export function useActivities(params?: Parameters<typeof api.getActivities>[0]) {
  return useApi(() => api.getActivities(params));
}

export function useActivity(id: string) {
  return useApi(() => api.getActivityById(id));
}

export function useActivityCategories() {
  return useApi(() => api.getActivityCategories());
}

// Trips hooks
export function useMyTrips(params?: { status?: string }) {
  return useApi(() => api.getMyTrips(params));
}

export function useTrip(id: string) {
  return useApi(() => api.getTripById(id));
}

// Itinerary hooks
export function useItinerary(tripId: string) {
  return useApi(() => api.getItineraryByTripId(tripId));
}

// Community hooks
export function useCommunityPosts(params?: Parameters<typeof api.getPosts>[0]) {
  return useApi(() => api.getPosts(params));
}

export function useCommunityPost(id: string) {
  return useApi(() => api.getPostById(id));
}

// User hooks
export function useProfile() {
  return useApi(() => api.getProfile());
}

export function usePreferences() {
  return useApi(() => api.getPreferences());
}

export function useSavedDestinations() {
  return useApi(() => api.getSavedDestinations());
}

// Admin hooks
export function useDashboardAnalytics() {
  return useApi(() => api.getDashboardAnalytics());
}

export default api;
