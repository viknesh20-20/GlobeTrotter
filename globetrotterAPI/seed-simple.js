import pg from 'pg';
import bcrypt from 'bcryptjs';
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

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Hash passwords
    const demoPassword = await bcrypt.hash('demo123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Insert users
    console.log('Seeding users...');
    const userResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, avatar_url)
      VALUES 
        ('demo@globetrotter.com', $1, 'Demo User', 'traveler', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'),
        ('admin@globetrotter.com', $2, 'Admin User', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `, [demoPassword, adminPassword]);
    
    const demoUserId = userResult.rows.find(r => r.email === 'demo@globetrotter.com')?.id;
    console.log(`Demo user ID: ${demoUserId}`);
    
    // Insert regions
    console.log('\nSeeding regions...');
    const regionResult = await client.query(`
      INSERT INTO regions (name) VALUES 
        ('Europe'), ('Asia'), ('North America'), ('South America'), ('Africa'), ('Oceania')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);
    
    const europeId = regionResult.rows.find(r => r.name === 'Europe')?.id;
    const asiaId = regionResult.rows.find(r => r.name === 'Asia')?.id;
    
    // Insert cities
    console.log('\nSeeding cities...');
    const cityResult = await client.query(`
      INSERT INTO cities (name, country, region_id, description, image_url, best_time_to_visit, average_cost_per_day, rating, latitude, longitude, timezone, currency, language)
      VALUES
        ('Paris', 'France', $1, 'The City of Light', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', 'April-October', 150, 4.8, 48.8566, 2.3522, 'Europe/Paris', 'EUR', 'French'),
        ('Tokyo', 'Japan', $2, 'A blend of tradition and modernity', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', 'March-May, September-November', 120, 4.7, 35.6762, 139.6503, 'Asia/Tokyo', 'JPY', 'Japanese'),
        ('New York', 'USA', (SELECT id FROM regions WHERE name = 'North America'), 'The Big Apple', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', 'April-June, September-November', 200, 4.6, 40.7128, -74.0060, 'America/New_York', 'USD', 'English')
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `, [europeId, asiaId]);
    
    const parisId = cityResult.rows.find(r => r.name === 'Paris')?.id;
    const tokyoId = cityResult.rows.find(r => r.name === 'Tokyo')?.id;
    
    // Insert activity categories
    console.log('\nSeeding activity categories...');
    const catResult = await client.query(`
      INSERT INTO activity_categories (name, icon) VALUES
        ('Sightseeing', '🏛️'),
        ('Food & Dining', '🍽️'),
        ('Adventure', '🏔️'),
        ('Culture', '🎭'),
        ('Shopping', '🛍️'),
        ('Nightlife', '🌙')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);
    
    const sightseeingId = catResult.rows.find(r => r.name === 'Sightseeing')?.id;
    
    // Insert activities
    if (parisId && sightseeingId) {
      console.log('\nSeeding activities...');
      await client.query(`
        INSERT INTO activities (name, city_id, category_id, description, estimated_cost, duration, rating, image_url, booking_required)
        VALUES
          ('Eiffel Tower Visit', $1, $2, 'Visit the iconic Eiffel Tower', 25, '2-3 hours', 4.9, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f', true),
          ('Louvre Museum', $1, $2, 'Explore world-famous art collections', 17, '3-4 hours', 4.8, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', true)
        ON CONFLICT DO NOTHING;
      `, [parisId, sightseeingId]);
    }
    
    // Insert user preferences
    if (demoUserId) {
      console.log('\nSeeding user preferences...');
      await client.query(`
        INSERT INTO user_preferences (user_id, interests, budget_range, travel_style, accommodation_preference)
        VALUES ($1, ARRAY['culture', 'food', 'history'], 'moderate', ARRAY['leisure', 'cultural'], ARRAY['hotel', 'hostel'])
        ON CONFLICT (user_id) DO NOTHING;
      `, [demoUserId]);
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📧 Demo credentials:');
    console.log('   Email: demo@globetrotter.com');
    console.log('   Password: demo123');
    console.log('\n👤 Admin credentials:');
    console.log('   Email: admin@globetrotter.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
