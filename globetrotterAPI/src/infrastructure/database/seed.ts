import bcrypt from 'bcryptjs';
import { query, testConnection, closePool, withTransaction } from './connection.js';

// Demo Users
const users = [
  { email: 'demo@globetrotter.com', password: 'demo123', fullName: 'Alex Wanderer', role: 'traveler' },
  { email: 'admin@globetrotter.com', password: 'admin123', fullName: 'Sarah Admin', role: 'admin' },
  { email: 'agency@globetrotter.com', password: 'agency123', fullName: 'Travel Agency', role: 'agency' }
];

// Regions
const regions = [
  { id: 'europe', name: 'Europe' },
  { id: 'asia', name: 'Asia' },
  { id: 'north-america', name: 'North America' },
  { id: 'oceania', name: 'Oceania' },
  { id: 'africa', name: 'Africa' },
  { id: 'middle-east', name: 'Middle East' },
  { id: 'south-america', name: 'South America' }
];

// Cities
const cities = [
  { name: 'Paris', country: 'France', regionId: 'europe', description: 'The City of Light, known for its art, fashion, gastronomy, and iconic Eiffel Tower.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', bestTimeToVisit: 'April - June, September - November', averageCostPerDay: 180, rating: 4.8, latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', currency: 'EUR', language: 'French' },
  { name: 'Tokyo', country: 'Japan', regionId: 'asia', description: 'A fascinating blend of ultra-modern and traditional, from neon-lit skyscrapers to historic temples.', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', bestTimeToVisit: 'March - May, September - November', averageCostPerDay: 150, rating: 4.9, latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', currency: 'JPY', language: 'Japanese' },
  { name: 'New York', country: 'United States', regionId: 'north-america', description: 'The city that never sleeps, featuring world-class museums, Broadway shows, and iconic landmarks.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', bestTimeToVisit: 'April - June, September - November', averageCostPerDay: 250, rating: 4.7, latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', currency: 'USD', language: 'English' },
  { name: 'Barcelona', country: 'Spain', regionId: 'europe', description: "A vibrant city known for Gaudí's architecture, beautiful beaches, and rich Catalan culture.", imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', bestTimeToVisit: 'May - June, September - October', averageCostPerDay: 120, rating: 4.7, latitude: 41.3851, longitude: 2.1734, timezone: 'Europe/Madrid', currency: 'EUR', language: 'Spanish' },
  { name: 'Bali', country: 'Indonesia', regionId: 'asia', description: 'A tropical paradise with stunning rice terraces, ancient temples, and world-class beaches.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', bestTimeToVisit: 'April - October', averageCostPerDay: 60, rating: 4.6, latitude: -8.3405, longitude: 115.0920, timezone: 'Asia/Makassar', currency: 'IDR', language: 'Indonesian' },
  { name: 'Dubai', country: 'UAE', regionId: 'middle-east', description: 'A futuristic city of record-breaking architecture, luxury shopping, and desert adventures.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', bestTimeToVisit: 'November - March', averageCostPerDay: 200, rating: 4.5, latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', currency: 'AED', language: 'Arabic' },
  { name: 'Rome', country: 'Italy', regionId: 'europe', description: 'The Eternal City, where ancient ruins stand alongside Renaissance masterpieces.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', bestTimeToVisit: 'April - June, September - October', averageCostPerDay: 140, rating: 4.8, latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome', currency: 'EUR', language: 'Italian' },
  { name: 'Sydney', country: 'Australia', regionId: 'oceania', description: 'A stunning harbour city with iconic architecture, beautiful beaches, and laid-back culture.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', bestTimeToVisit: 'September - November, March - May', averageCostPerDay: 180, rating: 4.7, latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', currency: 'AUD', language: 'English' },
  { name: 'London', country: 'United Kingdom', regionId: 'europe', description: 'A historic city blending royal heritage with cutting-edge culture, fashion, and cuisine.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', bestTimeToVisit: 'May - September', averageCostPerDay: 200, rating: 4.7, latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', currency: 'GBP', language: 'English' },
  { name: 'Bangkok', country: 'Thailand', regionId: 'asia', description: 'A bustling capital where ancient temples meet modern skyscrapers and legendary street food.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', bestTimeToVisit: 'November - February', averageCostPerDay: 50, rating: 4.5, latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok', currency: 'THB', language: 'Thai' },
  { name: 'Cape Town', country: 'South Africa', regionId: 'africa', description: 'A stunning coastal city nestled beneath Table Mountain with beautiful beaches.', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', bestTimeToVisit: 'November - March', averageCostPerDay: 80, rating: 4.6, latitude: -33.9249, longitude: 18.4241, timezone: 'Africa/Johannesburg', currency: 'ZAR', language: 'English' },
  { name: 'Amsterdam', country: 'Netherlands', regionId: 'europe', description: 'A charming city of canals, cycling culture, world-class museums, and rich artistic heritage.', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', bestTimeToVisit: 'April - May, September - November', averageCostPerDay: 150, rating: 4.6, latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam', currency: 'EUR', language: 'Dutch' }
];

// Activity Categories
const activityCategories = [
  { id: 'sightseeing', name: 'Sightseeing', icon: 'Camera' },
  { id: 'culture', name: 'Culture', icon: 'Landmark' },
  { id: 'food', name: 'Food & Dining', icon: 'Utensils' },
  { id: 'adventure', name: 'Adventure', icon: 'Mountain' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Star' },
  { id: 'relaxation', name: 'Relaxation', icon: 'Spa' }
];

// Activities
const activitiesData = [
  // Paris
  { name: 'Eiffel Tower Visit', cityName: 'Paris', category: 'sightseeing', description: 'Ascend the iconic iron lattice tower for panoramic views of Paris.', imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800', duration: '3 hours', estimatedCost: 26, rating: 4.7, location: 'Champ de Mars', bestTime: 'Evening', bookingRequired: true },
  { name: 'Louvre Museum Tour', cityName: 'Paris', category: 'culture', description: "Explore the world's largest art museum, home to the Mona Lisa.", imageUrl: 'https://images.unsplash.com/photo-1499426600726-ac36e6389cfc?w=800', duration: '4 hours', estimatedCost: 17, rating: 4.8, location: 'Rue de Rivoli', bestTime: 'Morning', bookingRequired: true },
  { name: 'Seine River Cruise', cityName: 'Paris', category: 'sightseeing', description: "Glide along the Seine and see Paris's landmarks from a unique waterside perspective.", imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=800', duration: '2 hours', estimatedCost: 35, rating: 4.6, location: 'Port de la Bourdonnais', bestTime: 'Sunset', bookingRequired: false },
  
  // Tokyo
  { name: 'Shibuya Crossing Experience', cityName: 'Tokyo', category: 'sightseeing', description: "Witness the world's busiest pedestrian crossing in the heart of Tokyo.", imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800', duration: '1 hour', estimatedCost: 0, rating: 4.5, location: 'Shibuya', bestTime: 'Evening', bookingRequired: false },
  { name: 'Senso-ji Temple Visit', cityName: 'Tokyo', category: 'culture', description: "Explore Tokyo's oldest temple, a stunning Buddhist shrine in Asakusa.", imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800', duration: '2 hours', estimatedCost: 0, rating: 4.7, location: 'Asakusa', bestTime: 'Morning', bookingRequired: false },
  { name: 'Tsukiji Outer Market Food Tour', cityName: 'Tokyo', category: 'food', description: 'Sample the freshest sushi and Japanese street food at the famous fish market area.', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', duration: '3 hours', estimatedCost: 60, rating: 4.8, location: 'Tsukiji', bestTime: 'Morning', bookingRequired: true },
  
  // New York
  { name: 'Statue of Liberty Tour', cityName: 'New York', category: 'sightseeing', description: "Visit America's iconic symbol of freedom on Liberty Island.", imageUrl: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800', duration: '4 hours', estimatedCost: 24, rating: 4.6, location: 'Liberty Island', bestTime: 'Morning', bookingRequired: true },
  { name: 'Central Park Bike Tour', cityName: 'New York', category: 'adventure', description: "Cycle through 840 acres of New York's beloved urban oasis.", imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', duration: '3 hours', estimatedCost: 45, rating: 4.7, location: 'Central Park', bestTime: 'Morning', bookingRequired: false },
  { name: 'Broadway Show', cityName: 'New York', category: 'entertainment', description: 'Experience world-class theater in the heart of Times Square.', imageUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800', duration: '3 hours', estimatedCost: 150, rating: 4.9, location: 'Broadway', bestTime: 'Evening', bookingRequired: true },
  
  // Barcelona
  { name: 'Sagrada Família Tour', cityName: 'Barcelona', category: 'culture', description: "Marvel at Gaudí's unfinished masterpiece, a UNESCO World Heritage Site.", imageUrl: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57?w=800', duration: '3 hours', estimatedCost: 26, rating: 4.9, location: 'Eixample', bestTime: 'Morning', bookingRequired: true },
  { name: 'La Boqueria Food Market', cityName: 'Barcelona', category: 'food', description: "Explore Barcelona's famous food market with fresh produce and tapas.", imageUrl: 'https://images.unsplash.com/photo-1579707160983-4a8f48c1fd68?w=800', duration: '2 hours', estimatedCost: 30, rating: 4.5, location: 'La Rambla', bestTime: 'Morning', bookingRequired: false },
  
  // Bali
  { name: 'Ubud Rice Terrace Trek', cityName: 'Bali', category: 'adventure', description: "Hike through Bali's stunning emerald rice paddies with a local guide.", imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800', duration: '4 hours', estimatedCost: 35, rating: 4.8, location: 'Ubud', bestTime: 'Morning', bookingRequired: true },
  { name: 'Uluwatu Temple Sunset', cityName: 'Bali', category: 'culture', description: 'Watch a traditional Kecak fire dance at this clifftop temple at sunset.', imageUrl: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800', duration: '3 hours', estimatedCost: 20, rating: 4.7, location: 'Uluwatu', bestTime: 'Sunset', bookingRequired: false },
  
  // Dubai
  { name: 'Burj Khalifa Observation Deck', cityName: 'Dubai', category: 'sightseeing', description: "Ascend to the world's tallest building for breathtaking views of Dubai.", imageUrl: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800', duration: '2 hours', estimatedCost: 50, rating: 4.8, location: 'Downtown Dubai', bestTime: 'Sunset', bookingRequired: true },
  { name: 'Desert Safari Adventure', cityName: 'Dubai', category: 'adventure', description: 'Experience dune bashing, camel rides, and a Bedouin camp dinner.', imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800', duration: '6 hours', estimatedCost: 80, rating: 4.6, location: 'Dubai Desert', bestTime: 'Afternoon', bookingRequired: true },
  
  // Rome
  { name: 'Colosseum Guided Tour', cityName: 'Rome', category: 'culture', description: "Step back in time at ancient Rome's most iconic amphitheater.", imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', duration: '3 hours', estimatedCost: 22, rating: 4.8, location: 'Piazza del Colosseo', bestTime: 'Morning', bookingRequired: true },
  { name: 'Vatican Museums & Sistine Chapel', cityName: 'Rome', category: 'culture', description: "Explore one of the world's greatest art collections and Michelangelo's masterpiece.", imageUrl: 'https://images.unsplash.com/photo-1541579130-1b34d340a99e?w=800', duration: '4 hours', estimatedCost: 28, rating: 4.9, location: 'Vatican City', bestTime: 'Morning', bookingRequired: true },
  
  // Sydney
  { name: 'Sydney Opera House Tour', cityName: 'Sydney', category: 'culture', description: "Go behind the scenes of Australia's most famous building.", imageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800', duration: '2 hours', estimatedCost: 43, rating: 4.7, location: 'Bennelong Point', bestTime: 'Morning', bookingRequired: true },
  { name: 'Bondi to Coogee Coastal Walk', cityName: 'Sydney', category: 'adventure', description: "Walk the stunning 6km coastal trail along Sydney's beautiful eastern beaches.", imageUrl: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=800', duration: '3 hours', estimatedCost: 0, rating: 4.8, location: 'Bondi Beach', bestTime: 'Morning', bookingRequired: false },
  
  // London
  { name: 'Tower of London Tour', cityName: 'London', category: 'culture', description: 'Explore 1000 years of royal history and see the Crown Jewels.', imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800', duration: '3 hours', estimatedCost: 33, rating: 4.7, location: 'Tower Hill', bestTime: 'Morning', bookingRequired: true },
  { name: 'British Museum Visit', cityName: 'London', category: 'culture', description: 'Discover world history through two million years of art and artifacts.', imageUrl: 'https://images.unsplash.com/photo-1574600395405-e96c8ef65a79?w=800', duration: '4 hours', estimatedCost: 0, rating: 4.8, location: 'Bloomsbury', bestTime: 'Morning', bookingRequired: false },
  
  // Bangkok
  { name: 'Grand Palace Tour', cityName: 'Bangkok', category: 'culture', description: "Explore Thailand's most sacred site and the dazzling Emerald Buddha.", imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800', duration: '3 hours', estimatedCost: 15, rating: 4.7, location: 'Phra Nakhon', bestTime: 'Morning', bookingRequired: false },
  { name: 'Floating Market Adventure', cityName: 'Bangkok', category: 'food', description: 'Navigate the colorful canals and shop from traditional wooden boats.', imageUrl: 'https://images.unsplash.com/photo-1541345023926-55d6e0853f4b?w=800', duration: '4 hours', estimatedCost: 25, rating: 4.5, location: 'Damnoen Saduak', bestTime: 'Morning', bookingRequired: true }
];

async function seed() {
  console.log('Starting database seeding...');
  
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot connect to database');
    process.exit(1);
  }
  
  try {
    await withTransaction(async (client) => {
      // Clear existing data
      console.log('Clearing existing data...');
      await client.query('TRUNCATE TABLE refresh_tokens, post_saves, post_likes, post_comments, community_posts, featured_destinations, scheduled_activities, itinerary_days, itinerary_stops, itineraries, trip_cities, trips, activities, activity_categories, saved_destinations, cities, regions, user_preferences, users CASCADE');
      
      // Insert regions
      console.log('Inserting regions...');
      for (const region of regions) {
        await client.query('INSERT INTO regions (id, name) VALUES ($1, $2)', [region.id, region.name]);
      }
      
      // Insert users
      console.log('Inserting users...');
      const userIds: Record<string, string> = {};
      for (const user of users) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        const result = await client.query(
          `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
          [user.email, passwordHash, user.fullName, user.role]
        );
        userIds[user.email] = result.rows[0].id;
        
        // Insert user preferences
        await client.query(
          `INSERT INTO user_preferences (user_id, interests, budget_range, travel_style, accommodation_preference)
           VALUES ($1, $2, $3, $4, $5)`,
          [result.rows[0].id, ['culture', 'food', 'adventure'], 'moderate', ['relaxed', 'cultural'], ['hotel', 'boutique']]
        );
      }
      console.log('User IDs:', userIds);
      
      // Insert activity categories
      console.log('Inserting activity categories...');
      for (const cat of activityCategories) {
        await client.query('INSERT INTO activity_categories (id, name, icon) VALUES ($1, $2, $3)', [cat.id, cat.name, cat.icon]);
      }
      
      // Insert cities
      console.log('Inserting cities...');
      const cityIds: Record<string, string> = {};
      for (const city of cities) {
        const result = await client.query(
          `INSERT INTO cities (name, country, region_id, description, image_url, best_time_to_visit, average_cost_per_day, rating, latitude, longitude, timezone, currency, language)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id`,
          [city.name, city.country, city.regionId, city.description, city.imageUrl, city.bestTimeToVisit, city.averageCostPerDay, city.rating, city.latitude, city.longitude, city.timezone, city.currency, city.language]
        );
        cityIds[city.name] = result.rows[0].id;
      }
      console.log('City IDs created');
      
      // Insert activities
      console.log('Inserting activities...');
      const activityIds: Record<string, string> = {};
      for (const act of activitiesData) {
        const cityId = cityIds[act.cityName];
        const result = await client.query(
          `INSERT INTO activities (name, city_id, category_id, description, image_url, duration, estimated_cost, rating, location, best_time, booking_required)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id`,
          [act.name, cityId, act.category, act.description, act.imageUrl, act.duration, act.estimatedCost, act.rating, act.location, act.bestTime, act.bookingRequired]
        );
        activityIds[act.name] = result.rows[0].id;
      }
      
      // Insert trips for demo user
      console.log('Inserting trips...');
      const demoUserId = userIds['demo@globetrotter.com'];
      
      const tripsToInsert = [
        { name: 'European Adventure', startDate: '2026-03-15', endDate: '2026-03-25', status: 'upcoming', budget: 3500, notes: 'A 10-day journey through Western Europe', cities: ['Paris', 'Barcelona', 'Rome'] },
        { name: 'Southeast Asia Escape', startDate: '2026-01-10', endDate: '2026-01-20', status: 'active', budget: 2000, notes: 'Exploring Thailand and Indonesia', cities: ['Bangkok', 'Bali'] },
        { name: 'NYC Weekend Getaway', startDate: '2025-10-05', endDate: '2025-10-08', status: 'completed', budget: 1500, notes: 'Quick trip to the Big Apple', cities: ['New York'] },
        { name: 'Japan Discovery', startDate: '2025-04-01', endDate: '2025-04-15', status: 'completed', budget: 4000, notes: 'Two weeks exploring Japan', cities: ['Tokyo'] },
        { name: 'Australian Adventure', startDate: '2026-06-01', endDate: '2026-06-14', status: 'planning', budget: 5000, notes: 'Sydney beaches and outback exploration', cities: ['Sydney'] }
      ];
      
      const tripIds: Record<string, string> = {};
      for (const trip of tripsToInsert) {
        const result = await client.query(
          `INSERT INTO trips (user_id, name, start_date, end_date, status, budget, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [demoUserId, trip.name, trip.startDate, trip.endDate, trip.status, trip.budget, trip.notes]
        );
        tripIds[trip.name] = result.rows[0].id;
        
        // Insert trip cities
        for (let i = 0; i < trip.cities.length; i++) {
          await client.query(
            `INSERT INTO trip_cities (trip_id, city_id, "order") VALUES ($1, $2, $3)`,
            [result.rows[0].id, cityIds[trip.cities[i]], i + 1]
          );
        }
      }
      
      // Create itinerary for European Adventure
      console.log('Creating itinerary for European Adventure...');
      const euroTripId = tripIds['European Adventure'];
      const itinResult = await client.query(
        `INSERT INTO itineraries (trip_id) VALUES ($1) RETURNING id`,
        [euroTripId]
      );
      const itineraryId = itinResult.rows[0].id;
      
      // Stop 1: Paris
      const stop1Result = await client.query(
        `INSERT INTO itinerary_stops (itinerary_id, city_id, "order", start_date, end_date, accommodation, notes)
         VALUES ($1, $2, 1, '2026-03-15', '2026-03-19', 'Hotel Le Marais', 'Arrival day - settle in')
         RETURNING id`,
        [itineraryId, cityIds['Paris']]
      );
      const stop1Id = stop1Result.rows[0].id;
      
      // Days for Paris
      const parisDay1 = await client.query(
        `INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, '2026-03-15', 'Arrival and evening exploration') RETURNING id`,
        [stop1Id]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '14:00', '17:00', 26, 'Booked sunset tickets', 'confirmed')`,
        [parisDay1.rows[0].id, activityIds['Eiffel Tower Visit']]
      );
      
      const parisDay2 = await client.query(
        `INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, '2026-03-16', 'Museum day') RETURNING id`,
        [stop1Id]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '09:00', '13:00', 17, 'Skip-the-line tickets', 'confirmed')`,
        [parisDay2.rows[0].id, activityIds['Louvre Museum Tour']]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '18:00', '20:00', 35, 'Dinner cruise', 'planned')`,
        [parisDay2.rows[0].id, activityIds['Seine River Cruise']]
      );
      
      // Stop 2: Barcelona
      const stop2Result = await client.query(
        `INSERT INTO itinerary_stops (itinerary_id, city_id, "order", start_date, end_date, accommodation, notes)
         VALUES ($1, $2, 2, '2026-03-19', '2026-03-22', 'Hotel Arts Barcelona', 'Train from Paris')
         RETURNING id`,
        [itineraryId, cityIds['Barcelona']]
      );
      const stop2Id = stop2Result.rows[0].id;
      
      const bcnDay1 = await client.query(
        `INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, '2026-03-19', 'Arrival and Gaudi tour') RETURNING id`,
        [stop2Id]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '10:00', '13:00', 26, 'Morning tour', 'planned')`,
        [bcnDay1.rows[0].id, activityIds['Sagrada Família Tour']]
      );
      
      // Stop 3: Rome
      const stop3Result = await client.query(
        `INSERT INTO itinerary_stops (itinerary_id, city_id, "order", start_date, end_date, accommodation, notes)
         VALUES ($1, $2, 3, '2026-03-22', '2026-03-25', 'Hotel Hassler Roma', 'Flight from Barcelona')
         RETURNING id`,
        [itineraryId, cityIds['Rome']]
      );
      const stop3Id = stop3Result.rows[0].id;
      
      const romeDay1 = await client.query(
        `INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, '2026-03-22', 'Ancient Rome') RETURNING id`,
        [stop3Id]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '09:00', '12:00', 22, 'Guided tour', 'planned')`,
        [romeDay1.rows[0].id, activityIds['Colosseum Guided Tour']]
      );
      
      const romeDay2 = await client.query(
        `INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, '2026-03-23', 'Vatican day') RETURNING id`,
        [stop3Id]
      );
      await client.query(
        `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, estimated_cost, notes, status)
         VALUES ($1, $2, '08:00', '12:00', 28, 'Early entry booked', 'confirmed')`,
        [romeDay2.rows[0].id, activityIds['Vatican Museums & Sistine Chapel']]
      );
      
      // Insert community posts
      console.log('Inserting community posts...');
      const adminUserId = userIds['admin@globetrotter.com'];
      
      const post1Result = await client.query(
        `INSERT INTO community_posts (user_id, city_id, title, content, images, trip_dates)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [demoUserId, cityIds['New York'], 'NYC Weekend Getaway - Must Do List!', 'Had an amazing 3 days in New York! Here are all my tips and recommendations...', ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'], 'October 5-8, 2025']
      );
      
      await client.query(
        `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3)`,
        [post1Result.rows[0].id, adminUserId, 'Great itinerary! Adding this to my bucket list.']
      );
      
      const post2Result = await client.query(
        `INSERT INTO community_posts (user_id, city_id, title, content, images, trip_dates)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [demoUserId, cityIds['Tokyo'], 'Two Weeks in Japan - Complete Guide', 'Everything you need to know for an unforgettable Japan trip. From temples to tech!', ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'], 'April 1-15, 2025']
      );
      
      await client.query(
        `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3)`,
        [post2Result.rows[0].id, adminUserId, 'Cherry blossom season is the best!']
      );
      
      await client.query(
        `INSERT INTO community_posts (user_id, title, content, images)
         VALUES ($1, $2, $3, $4)`,
        [adminUserId, 'Top 10 Budget Travel Tips for 2026', 'Save money while exploring the world with these proven strategies...', ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800']]
      );
      
      // Insert featured destinations
      console.log('Inserting featured destinations...');
      await client.query(
        `INSERT INTO featured_destinations (city_id, reason, display_order) VALUES ($1, $2, $3)`,
        [cityIds['Paris'], 'Most saved destination this month', 1]
      );
      await client.query(
        `INSERT INTO featured_destinations (city_id, reason, display_order) VALUES ($1, $2, $3)`,
        [cityIds['Tokyo'], 'Trending for spring travel', 2]
      );
      await client.query(
        `INSERT INTO featured_destinations (city_id, reason, display_order) VALUES ($1, $2, $3)`,
        [cityIds['Bali'], 'Best value destination', 3]
      );
      
      // Save some destinations for demo user
      await client.query(
        `INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2)`,
        [demoUserId, cityIds['Paris']]
      );
      await client.query(
        `INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2)`,
        [demoUserId, cityIds['New York']]
      );
      await client.query(
        `INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2)`,
        [demoUserId, cityIds['Tokyo']]
      );
      
      console.log('Seeding completed successfully!');
      console.log('\n=== Demo Credentials ===');
      console.log('Traveler: demo@globetrotter.com / demo123');
      console.log('Admin: admin@globetrotter.com / admin123');
      console.log('Agency: agency@globetrotter.com / agency123');
    });
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

seed().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
