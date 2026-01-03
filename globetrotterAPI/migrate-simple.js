import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'globetrotterdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1968'
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migrations...\n');
    
    // Users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'traveler' CHECK (role IN ('admin', 'traveler', 'agency')),
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User preferences
    console.log('Creating user_preferences table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        interests TEXT[] DEFAULT '{}',
        budget_range VARCHAR(50) DEFAULT 'moderate',
        travel_style TEXT[] DEFAULT '{}',
        accommodation_preference TEXT[] DEFAULT '{}'
      );
    `);

    // Regions
    console.log('Creating regions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    // Cities
    console.log('Creating cities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        region_id UUID REFERENCES regions(id),
        description TEXT,
        image_url TEXT,
        best_time_to_visit VARCHAR(255),
        average_cost_per_day DECIMAL(10, 2),
        rating DECIMAL(3, 2) DEFAULT 0,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        timezone VARCHAR(100),
        currency VARCHAR(10),
        language VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Saved destinations
    console.log('Creating saved_destinations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_destinations (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, city_id)
      );
    `);

    // Activity categories
    console.log('Creating activity_categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(100)
      );
    `);

    // Activities
    console.log('Creating activities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        category_id UUID REFERENCES activity_categories(id),
        description TEXT,
        estimated_cost DECIMAL(10, 2),
        duration VARCHAR(100),
        rating DECIMAL(3, 2) DEFAULT 0,
        image_url TEXT,
        location TEXT,
        best_time VARCHAR(100),
        booking_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trips
    console.log('Creating trips table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        budget DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'active', 'completed')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Trip cities (many-to-many)
    console.log('Creating trip_cities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_cities (
        trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        city_order INTEGER NOT NULL,
        PRIMARY KEY (trip_id, city_id)
      );
    `);

    // Itineraries
    console.log('Creating itineraries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trip_id UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Itinerary stops
    console.log('Creating itinerary_stops table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS itinerary_stops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
        city_id UUID REFERENCES cities(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        accommodation TEXT,
        notes TEXT,
        stop_order INTEGER NOT NULL
      );
    `);

    // Itinerary days
    console.log('Creating itinerary_days table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS itinerary_days (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stop_id UUID REFERENCES itinerary_stops(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        notes TEXT
      );
    `);

    // Scheduled activities
    console.log('Creating scheduled_activities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
        activity_id UUID REFERENCES activities(id),
        start_time TIME,
        end_time TIME,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
        actual_cost DECIMAL(10, 2)
      );
    `);

    // Community posts
    console.log('Creating community_posts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        city_id UUID REFERENCES cities(id),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        images TEXT[] DEFAULT '{}',
        trip_dates VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post comments
    console.log('Creating post_comments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post likes
    console.log('Creating post_likes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
    `);

    // Post saves
    console.log('Creating post_saves table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_saves (
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
    `);

    // Featured destinations
    console.log('Creating featured_destinations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS featured_destinations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        display_order INTEGER NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Refresh tokens
    console.log('Creating refresh_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    console.log('\nCreating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_posts_city ON community_posts(city_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);');
    
    console.log('\n✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
