import { query, testConnection, closePool } from './connection.js';

const migrations = [
  // Create types
  `
  DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'traveler', 'agency');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  `,
  
  `
  DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('planning', 'upcoming', 'active', 'completed');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  `,
  
  `
  DO $$ BEGIN
    CREATE TYPE activity_status AS ENUM ('planned', 'confirmed', 'completed', 'cancelled');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  `,
  
  // Create users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role DEFAULT 'traveler',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create user_preferences table
  `
  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    interests TEXT[] DEFAULT '{}',
    budget_range VARCHAR(50) DEFAULT 'moderate',
    travel_style TEXT[] DEFAULT '{}',
    accommodation_preference TEXT[] DEFAULT '{}'
  );
  `,
  
  // Create regions table
  `
  CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );
  `,
  
  // Create cities table
  `
  CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region_id VARCHAR(50) REFERENCES regions(id),
    description TEXT,
    image_url TEXT,
    best_time_to_visit VARCHAR(100),
    average_cost_per_day DECIMAL(10,2),
    rating DECIMAL(2,1) DEFAULT 4.0,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    timezone VARCHAR(50),
    currency VARCHAR(10),
    language VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create saved_destinations table
  `
  CREATE TABLE IF NOT EXISTS saved_destinations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, city_id)
  );
  `,
  
  // Create activity_categories table
  `
  CREATE TABLE IF NOT EXISTS activity_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50)
  );
  `,
  
  // Create activities table
  `
  CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES activity_categories(id),
    description TEXT,
    estimated_cost DECIMAL(10,2),
    duration VARCHAR(50),
    rating DECIMAL(2,1) DEFAULT 4.0,
    image_url TEXT,
    location VARCHAR(200),
    best_time VARCHAR(100),
    booking_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create trips table
  `
  CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    status trip_status DEFAULT 'planning',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create trip_cities table
  `
  CREATE TABLE IF NOT EXISTS trip_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL
  );
  `,
  
  // Create itineraries table
  `
  CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create itinerary_stops table
  `
  CREATE TABLE IF NOT EXISTS itinerary_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    accommodation VARCHAR(200),
    notes TEXT,
    "order" INTEGER NOT NULL
  );
  `,
  
  // Create itinerary_days table
  `
  CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id UUID REFERENCES itinerary_stops(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT
  );
  `,
  
  // Create scheduled_activities table
  `
  CREATE TABLE IF NOT EXISTS scheduled_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    start_time TIME,
    end_time TIME,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    notes TEXT,
    status activity_status DEFAULT 'planned'
  );
  `,
  
  // Create community_posts table
  `
  CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    trip_dates VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create post_comments table
  `
  CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create post_likes table
  `
  CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  );
  `,
  
  // Create post_saves table
  `
  CREATE TABLE IF NOT EXISTS post_saves (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  );
  `,
  
  // Create featured_destinations table
  `
  CREATE TABLE IF NOT EXISTS featured_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE UNIQUE,
    reason VARCHAR(200),
    display_order INTEGER NOT NULL
  );
  `,
  
  // Create refresh_tokens table
  `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `,
  
  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
  `CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region_id);`,
  `CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);`,
  `CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city_id);`,
  `CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);`,
  `CREATE INDEX IF NOT EXISTS idx_itineraries_trip ON itineraries(trip_id);`,
  `CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_posts_city ON community_posts(city_id);`,
  `CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);`,
];

async function runMigrations() {
  console.log('Starting database migrations...');
  
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot connect to database. Please ensure PostgreSQL is running and the database exists.');
    console.log('To create the database, run: CREATE DATABASE globetrotterdb;');
    process.exit(1);
  }
  
  for (let i = 0; i < migrations.length; i++) {
    try {
      await query(migrations[i]);
      console.log(`Migration ${i + 1}/${migrations.length} completed`);
    } catch (error) {
      console.error(`Migration ${i + 1} failed:`, error);
      throw error;
    }
  }
  
  console.log('All migrations completed successfully!');
  await closePool();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
