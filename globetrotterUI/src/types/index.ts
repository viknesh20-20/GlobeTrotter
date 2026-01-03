// User Types
export type UserRole = 'admin' | 'traveler' | 'agency';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    bio?: string;
    city?: string;
    country?: string;
    phone?: string;
    preferences?: UserPreferences;
    savedDestinations?: string[];
}

export interface UserPreferences {
    currency: string;
    language: string;
    notifications: boolean;
}

// City Types
export interface City {
    id: string;
    name: string;
    country: string;
    countryCode: string;
    region: string;
    description: string;
    image: string;
    costIndex: number;
    popularity: number;
    currency: string;
    language: string;
    timezone: string;
    bestTimeToVisit: string;
    averageDailyBudget: number;
    highlights: string[];
}

export interface Region {
    id: string;
    name: string;
    emoji: string;
}

// Activity Types
export interface Activity {
    id: string;
    name: string;
    cityId: string;
    category: string;
    type: string;
    description: string;
    image: string;
    duration: number;
    cost: number;
    rating: number;
    reviews: number;
    bestTimeOfDay: string;
    tips: string;
}

export interface ActivityCategory {
    id: string;
    name: string;
    icon: string;
}

// Trip Types
export interface Trip {
    id: string;
    userId: string;
    name: string;
    description: string;
    coverImage: string;
    startDate: string;
    endDate: string;
    status: 'ongoing' | 'upcoming' | 'completed';
    totalBudget: number;
    estimatedCost: number;
    cities: string[];
    isPublic: boolean;
    likes: number;
    createdAt: string;
    updatedAt: string;
}

// Itinerary Types
export interface Itinerary {
    id: string;
    tripId: string;
    stops: ItineraryStop[];
    totalCost: TotalCost;
}

export interface ItineraryStop {
    id: string;
    cityId: string;
    order: number;
    arrivalDate: string;
    departureDate: string;
    days: ItineraryDay[];
}

export interface ItineraryDay {
    date: string;
    dayNumber: number;
    activities: ScheduledActivity[];
    expenses: DayExpenses;
}

export interface ScheduledActivity {
    activityId: string;
    startTime: string;
    endTime: string;
    notes: string;
    cost: number;
}

export interface DayExpenses {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    other: number;
}

export interface TotalCost {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    other: number;
    grand: number;
}

// Community Types
export interface CommunityPost {
    id: string;
    userId: string;
    tripId: string | null;
    title: string;
    description: string;
    coverImage: string;
    likes: number;
    saves: number;
    comments: Comment[];
    tags: string[];
    createdAt: string;
}

export interface Comment {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
}

// Analytics Types
export interface AnalyticsOverview {
    totalUsers: number;
    totalTrips: number;
    totalCitiesVisited: number;
    averageTripsPerUser: number;
    platformGrowth: number;
}

export interface MonthlyData {
    month: string;
    users?: number;
    trips?: number;
    revenue?: number;
}

export interface PopularCity {
    cityId: string;
    name: string;
    visits: number;
    change: number;
}

export interface PopularActivity {
    activityId: string;
    name: string;
    bookings: number;
}

// Auth Types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    country: string;
}
