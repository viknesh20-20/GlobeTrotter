# GlobeTrotter Backend Implementation Plan

## Project Overview
A full-featured backend API for the GlobeTrotter travel planning application built with:
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL (globetrotterdb)
- **Architecture**: Clean Architecture
- **Authentication**: JWT with RBAC
- **Documentation**: Swagger/OpenAPI

## Database Connection Details
- **Host**: localhost
- **Database**: globetrotterdb
- **User**: postgres
- **Password**: 1968

## Clean Architecture Structure
```
globetrotterAPI/
├── src/
│   ├── domain/                 # Enterprise business rules
│   │   ├── entities/           # Domain entities
│   │   └── repositories/       # Repository interfaces
│   ├── application/            # Application business rules
│   │   ├── use-cases/          # Use cases
│   │   └── interfaces/         # Application interfaces
│   ├── infrastructure/         # Frameworks & drivers
│   │   ├── database/           # Database connection & migrations
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── repositories/       # Repository implementations
│   │   └── services/           # External services
│   ├── presentation/           # Interface adapters
│   │   ├── controllers/        # Express controllers
│   │   ├── middlewares/        # Express middlewares
│   │   ├── routes/             # Express routes
│   │   └── validators/         # Request validators
│   ├── config/                 # Configuration
│   └── shared/                 # Shared utilities
│       ├── errors/             # Custom errors
│       └── utils/              # Utility functions
├── tests/                      # Tests
├── package.json
├── tsconfig.json
└── swagger.json
```

## Database Schema Design

### Tables

#### 1. users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | |
| city | VARCHAR(100) | |
| country | VARCHAR(100) | |
| avatar | TEXT | |
| bio | TEXT | |
| role | ENUM('admin', 'traveler', 'agency') | DEFAULT 'traveler' |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 2. user_preferences
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| currency | VARCHAR(10) | DEFAULT 'USD' |
| language | VARCHAR(10) | DEFAULT 'en' |
| notifications | BOOLEAN | DEFAULT true |

#### 3. regions
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(50) | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| emoji | VARCHAR(10) | |

#### 4. cities
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| country | VARCHAR(100) | NOT NULL |
| country_code | VARCHAR(5) | NOT NULL |
| region_id | VARCHAR(50) | REFERENCES regions(id) |
| description | TEXT | |
| image | TEXT | |
| cost_index | INTEGER | CHECK (cost_index >= 1 AND cost_index <= 5) |
| popularity | INTEGER | DEFAULT 0 |
| currency | VARCHAR(10) | |
| language | VARCHAR(100) | |
| timezone | VARCHAR(50) | |
| best_time_to_visit | VARCHAR(100) | |
| average_daily_budget | DECIMAL(10,2) | |
| highlights | TEXT[] | |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### 5. saved_destinations
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| city_id | UUID | REFERENCES cities(id) ON DELETE CASCADE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(user_id, city_id) | | |

#### 6. activity_categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(50) | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| icon | VARCHAR(50) | |

#### 7. activities
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| city_id | UUID | REFERENCES cities(id) ON DELETE CASCADE |
| category_id | VARCHAR(50) | REFERENCES activity_categories(id) |
| type | VARCHAR(50) | |
| description | TEXT | |
| image | TEXT | |
| duration | DECIMAL(4,1) | |
| cost | DECIMAL(10,2) | |
| rating | DECIMAL(2,1) | |
| reviews_count | INTEGER | DEFAULT 0 |
| best_time_of_day | VARCHAR(20) | |
| tips | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### 8. trips
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | |
| cover_image | TEXT | |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM('ongoing', 'upcoming', 'completed') | DEFAULT 'upcoming' |
| total_budget | DECIMAL(10,2) | |
| estimated_cost | DECIMAL(10,2) | |
| is_public | BOOLEAN | DEFAULT false |
| likes_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 9. trip_cities
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| trip_id | UUID | REFERENCES trips(id) ON DELETE CASCADE |
| city_id | UUID | REFERENCES cities(id) ON DELETE CASCADE |
| order | INTEGER | NOT NULL |

#### 10. itineraries
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| trip_id | UUID | REFERENCES trips(id) ON DELETE CASCADE UNIQUE |
| total_accommodation | DECIMAL(10,2) | DEFAULT 0 |
| total_food | DECIMAL(10,2) | DEFAULT 0 |
| total_transport | DECIMAL(10,2) | DEFAULT 0 |
| total_activities | DECIMAL(10,2) | DEFAULT 0 |
| total_other | DECIMAL(10,2) | DEFAULT 0 |
| grand_total | DECIMAL(10,2) | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 11. itinerary_stops
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| itinerary_id | UUID | REFERENCES itineraries(id) ON DELETE CASCADE |
| city_id | UUID | REFERENCES cities(id) |
| order | INTEGER | NOT NULL |
| arrival_date | DATE | NOT NULL |
| departure_date | DATE | NOT NULL |

#### 12. itinerary_days
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| stop_id | UUID | REFERENCES itinerary_stops(id) ON DELETE CASCADE |
| date | DATE | NOT NULL |
| day_number | INTEGER | NOT NULL |
| accommodation_expense | DECIMAL(10,2) | DEFAULT 0 |
| food_expense | DECIMAL(10,2) | DEFAULT 0 |
| transport_expense | DECIMAL(10,2) | DEFAULT 0 |
| activities_expense | DECIMAL(10,2) | DEFAULT 0 |
| other_expense | DECIMAL(10,2) | DEFAULT 0 |

#### 13. scheduled_activities
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| day_id | UUID | REFERENCES itinerary_days(id) ON DELETE CASCADE |
| activity_id | UUID | REFERENCES activities(id) |
| start_time | TIME | |
| end_time | TIME | |
| notes | TEXT | |
| cost | DECIMAL(10,2) | |

#### 14. community_posts
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| trip_id | UUID | REFERENCES trips(id) ON DELETE SET NULL |
| title | VARCHAR(300) | NOT NULL |
| description | TEXT | |
| cover_image | TEXT | |
| likes_count | INTEGER | DEFAULT 0 |
| saves_count | INTEGER | DEFAULT 0 |
| tags | TEXT[] | |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### 15. post_comments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| post_id | UUID | REFERENCES community_posts(id) ON DELETE CASCADE |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| text | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### 16. post_likes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| post_id | UUID | REFERENCES community_posts(id) ON DELETE CASCADE |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(post_id, user_id) | | |

#### 17. post_saves
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| post_id | UUID | REFERENCES community_posts(id) ON DELETE CASCADE |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(post_id, user_id) | | |

#### 18. featured_destinations
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| city_id | UUID | REFERENCES cities(id) ON DELETE CASCADE |
| reason | VARCHAR(200) | |
| order | INTEGER | NOT NULL |

#### 19. refresh_tokens
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE |
| token | VARCHAR(500) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

## API Endpoints

### Authentication
- POST /api/auth/login - Login user
- POST /api/auth/register - Register new user
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Users
- GET /api/users - Get all users (admin)
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user (admin)
- PUT /api/users/:id/preferences - Update user preferences
- GET /api/users/:id/saved-destinations - Get saved destinations
- POST /api/users/:id/saved-destinations - Save destination
- DELETE /api/users/:id/saved-destinations/:cityId - Remove saved destination

### Cities
- GET /api/cities - Get all cities (with filters)
- GET /api/cities/:id - Get city by ID
- POST /api/cities - Create city (admin)
- PUT /api/cities/:id - Update city (admin)
- DELETE /api/cities/:id - Delete city (admin)
- GET /api/cities/regions - Get all regions

### Activities
- GET /api/activities - Get all activities (with filters)
- GET /api/activities/:id - Get activity by ID
- POST /api/activities - Create activity (admin)
- PUT /api/activities/:id - Update activity (admin)
- DELETE /api/activities/:id - Delete activity (admin)
- GET /api/activities/categories - Get activity categories
- GET /api/activities/city/:cityId - Get activities by city

### Trips
- GET /api/trips - Get user's trips
- GET /api/trips/:id - Get trip by ID
- POST /api/trips - Create trip
- PUT /api/trips/:id - Update trip
- DELETE /api/trips/:id - Delete trip
- PUT /api/trips/:id/status - Update trip status
- GET /api/trips/all - Get all trips (admin)

### Itineraries
- GET /api/itineraries/trip/:tripId - Get itinerary for trip
- POST /api/itineraries - Create/Update itinerary
- PUT /api/itineraries/:id - Update itinerary
- POST /api/itineraries/:id/stops - Add stop
- PUT /api/itineraries/:id/stops/:stopId - Update stop
- DELETE /api/itineraries/:id/stops/:stopId - Delete stop
- POST /api/itineraries/:id/stops/:stopId/days/:dayId/activities - Add activity
- DELETE /api/itineraries/:id/stops/:stopId/days/:dayId/activities/:activityId - Remove activity

### Community
- GET /api/community/posts - Get all posts
- GET /api/community/posts/:id - Get post by ID
- POST /api/community/posts - Create post
- PUT /api/community/posts/:id - Update post
- DELETE /api/community/posts/:id - Delete post
- POST /api/community/posts/:id/like - Like post
- DELETE /api/community/posts/:id/like - Unlike post
- POST /api/community/posts/:id/save - Save post
- DELETE /api/community/posts/:id/save - Unsave post
- POST /api/community/posts/:id/comments - Add comment
- DELETE /api/community/posts/:id/comments/:commentId - Delete comment
- GET /api/community/featured - Get featured destinations

### Analytics (Admin)
- GET /api/analytics/overview - Get platform overview
- GET /api/analytics/users - Get user stats
- GET /api/analytics/trips - Get trip stats
- GET /api/analytics/popular-cities - Get popular cities
- GET /api/analytics/popular-activities - Get popular activities

## Demo Data

### Demo Users
1. **Traveler**
   - Email: demo@globetrotter.com
   - Password: demo123
   - Role: traveler

2. **Admin**
   - Email: admin@globetrotter.com
   - Password: admin123
   - Role: admin

### Demo Cities (12 cities)
Paris, Tokyo, New York, Barcelona, Bali, Dubai, Rome, Sydney, London, Bangkok, Cape Town, Amsterdam

### Demo Activities (24+ activities)
Various activities for each city including sightseeing, culture, food, adventure, entertainment

### Demo Trips (5 trips)
- European Adventure
- Southeast Asia Escape
- NYC Weekend Getaway
- Japan Discovery
- Australian Adventure

### Demo Itinerary
Full itinerary for European Adventure trip

### Demo Community Posts (3 posts)
- NYC Weekend Getaway - Must Do List!
- Two Weeks in Japan - Complete Guide
- Top 10 Budget Travel Tips for 2026

## Implementation Order
1. Project Setup & Configuration
2. Database Migrations
3. Database Seeds
4. Domain Entities
5. Repository Interfaces & Implementations
6. Use Cases
7. Controllers & Routes
8. Middlewares (Auth, RBAC, Error Handling)
9. Swagger Documentation
10. Frontend Integration
11. Testing
