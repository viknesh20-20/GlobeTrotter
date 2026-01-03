# GlobeTrotter API - Backend Implementation

## Overview

A complete Node.js/Express/TypeScript backend API for the GlobeTrotter travel planning application, implementing Clean Architecture with PostgreSQL database.

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh tokens)
- **Authorization**: Role-Based Access Control (RBAC)
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Clean Architecture (Domain/Application/Infrastructure/Presentation)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Traveler | demo@globetrotter.com | demo123 |
| Admin | admin@globetrotter.com | admin123 |
| Agency | agency@globetrotter.com | agency123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/profile` - Get profile details
- `PUT /api/users/profile` - Update profile
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/saved-destinations` - Get saved destinations
- `POST /api/users/saved-destinations` - Save a destination
- `DELETE /api/users/saved-destinations/:cityId` - Remove saved destination
- `GET /api/users` - (Admin) Get all users
- `DELETE /api/users/:id` - (Admin) Delete user

### Cities
- `GET /api/cities` - Get all cities (with filters)
- `GET /api/cities/:id` - Get city by ID
- `GET /api/cities/regions` - Get all regions

### Activities
- `GET /api/activities` - Get all activities (with filters)
- `GET /api/activities/:id` - Get activity by ID
- `GET /api/activities/categories` - Get activity categories

### Trips
- `GET /api/trips/my-trips` - Get user's trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/trips` - (Admin) Get all trips

### Itineraries
- `GET /api/itineraries/trip/:tripId` - Get itinerary by trip ID
- `POST /api/itineraries` - Create new itinerary
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary
- `POST /api/itineraries/:id/stops` - Add stop to itinerary
- `PUT /api/itineraries/:id/stops/:stopId` - Update stop
- `DELETE /api/itineraries/:id/stops/:stopId` - Delete stop
- `POST /api/itineraries/:id/days/:dayId/activities` - Add activity
- `DELETE /api/itineraries/:id/activities/:activityId` - Remove activity

### Community
- `GET /api/community/posts` - Get all posts
- `GET /api/community/posts/:id` - Get post by ID
- `POST /api/community/posts` - Create new post
- `PUT /api/community/posts/:id` - Update post
- `DELETE /api/community/posts/:id` - Delete post
- `POST /api/community/posts/:id/like` - Like a post
- `DELETE /api/community/posts/:id/like` - Unlike a post
- `POST /api/community/posts/:id/comments` - Add comment
- `GET /api/community/featured` - Get featured destinations

### Analytics (Admin only)
- `GET /api/analytics/dashboard` - Get dashboard analytics

## Health Check
- `GET /health` - Server health check

## API Documentation
- `GET /api-docs` - Swagger UI documentation

## Database Schema

### Tables
- `users` - User accounts
- `user_preferences` - User settings
- `regions` - Geographic regions
- `cities` - City information
- `activity_categories` - Activity categories
- `activities` - Things to do
- `trips` - User trips
- `trip_cities` - Trip-city relationships
- `itineraries` - Trip itineraries
- `itinerary_stops` - Stops within itineraries
- `itinerary_days` - Days within stops
- `scheduled_activities` - Activities scheduled for days
- `community_posts` - Community posts
- `post_comments` - Post comments
- `post_likes` - Post likes
- `saved_destinations` - User's saved cities
- `featured_destinations` - Featured destinations

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
cd globetrotterAPI
npm install
```

### Environment Setup

Create `.env` file:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:1968@localhost:5432/globetrotterdb
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

### Development

```bash
# Build
npm run build

# Start server
npm start

# Development with watch
npm run dev
```

## Architecture

```
src/
├── config/           # Configuration
├── domain/           # Business entities & interfaces
│   ├── entities/     # Entity definitions
│   └── repositories/ # Repository interfaces
├── application/      # Use cases & business logic
│   └── use-cases/    # Service implementations
├── infrastructure/   # External concerns
│   ├── database/     # Database connection & migrations
│   └── repositories/ # Repository implementations
└── presentation/     # HTTP layer
    ├── controllers/  # Route handlers
    ├── middleware/   # Auth, validation, errors
    └── routes/       # Route definitions
```

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Helmet security headers
- Input validation

## Status

✅ Fully implemented and tested
