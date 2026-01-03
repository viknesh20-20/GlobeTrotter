import { ITripRepository } from '../../domain/repositories/ITripRepository.js';
import { Trip, TripWithCities, CreateTripDTO, UpdateTripDTO, TripFilters } from '../../domain/entities/Trip.js';
import { query } from '../database/connection.js';

export class TripRepository implements ITripRepository {
  async findById(id: string): Promise<TripWithCities | null> {
    const result = await query<TripWithCities>(
      `SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'country', c.country,
              'image_url', c.image_url,
              'order', tc."order"
            ) ORDER BY tc."order"
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) as cities
       FROM trips t
       LEFT JOIN trip_cities tc ON t.id = tc.trip_id
       LEFT JOIN cities c ON tc.city_id = c.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId: string, filters?: TripFilters): Promise<TripWithCities[]> {
    let sql = `
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'country', c.country,
              'image_url', c.image_url,
              'order', tc."order"
            ) ORDER BY tc."order"
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) as cities
       FROM trips t
       LEFT JOIN trip_cities tc ON t.id = tc.trip_id
       LEFT JOIN cities c ON tc.city_id = c.id
       WHERE t.user_id = $1
    `;
    const params: any[] = [userId];
    let paramCount = 2;

    if (filters?.status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(filters.status);
    }

    sql += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const result = await query<TripWithCities>(sql, params);
    return result.rows;
  }

  async findAll(filters?: TripFilters): Promise<TripWithCities[]> {
    let sql = `
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'country', c.country,
              'image_url', c.image_url,
              'order', tc."order"
            ) ORDER BY tc."order"
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) as cities
       FROM trips t
       LEFT JOIN trip_cities tc ON t.id = tc.trip_id
       LEFT JOIN cities c ON tc.city_id = c.id
       WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(filters.status);
    }

    sql += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await query<TripWithCities>(sql, params);
    return result.rows;
  }

  async create(userId: string, data: CreateTripDTO): Promise<TripWithCities> {
    const tripResult = await query<Trip>(
      `INSERT INTO trips (user_id, name, start_date, end_date, budget, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, data.name, data.start_date, data.end_date, data.budget, data.status || 'planning', data.notes || null]
    );

    const trip = tripResult.rows[0];

    // Add cities if provided
    if (data.city_ids && data.city_ids.length > 0) {
      for (let i = 0; i < data.city_ids.length; i++) {
        await query(
          'INSERT INTO trip_cities (trip_id, city_id, "order") VALUES ($1, $2, $3)',
          [trip.id, data.city_ids[i], i + 1]
        );
      }
    }

    return (await this.findById(trip.id))!;
  }

  async update(id: string, data: UpdateTripDTO): Promise<TripWithCities | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.start_date !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(data.end_date);
    }
    if (data.budget !== undefined) {
      fields.push(`budget = $${paramCount++}`);
      values.push(data.budget);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await query(
        `UPDATE trips SET ${fields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }

    // Update cities if provided
    if (data.city_ids !== undefined) {
      await query('DELETE FROM trip_cities WHERE trip_id = $1', [id]);
      
      if (data.city_ids.length > 0) {
        for (let i = 0; i < data.city_ids.length; i++) {
          await query(
            'INSERT INTO trip_cities (trip_id, city_id, "order") VALUES ($1, $2, $3)',
            [id, data.city_ids[i], i + 1]
          );
        }
      }
    }

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM trips WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateStatus(id: string): Promise<Trip | null> {
    const trip = await query<Trip>('SELECT * FROM trips WHERE id = $1', [id]);
    if (!trip.rows[0]) return null;

    const now = new Date();
    const startDate = new Date(trip.rows[0].start_date);
    const endDate = new Date(trip.rows[0].end_date);

    let newStatus: 'planning' | 'upcoming' | 'active' | 'completed' = 'planning';

    if (now < startDate) {
      newStatus = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      newStatus = 'active';
    } else if (now > endDate) {
      newStatus = 'completed';
    }

    const result = await query<Trip>(
      'UPDATE trips SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, id]
    );
    return result.rows[0] || null;
  }

  async count(): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM trips');
    return parseInt(result.rows[0].count);
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM trips WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0].count);
  }

  async countByStatus(status: string): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM trips WHERE status = $1', [status]);
    return parseInt(result.rows[0].count);
  }
}
