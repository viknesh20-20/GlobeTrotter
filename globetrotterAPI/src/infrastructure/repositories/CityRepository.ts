import { ICityRepository } from '../../domain/repositories/ICityRepository.js';
import { City, CreateCityDTO, UpdateCityDTO, CityFilters, Region } from '../../domain/entities/City.js';
import { query } from '../database/connection.js';

export class CityRepository implements ICityRepository {
  async findById(id: string): Promise<City | null> {
    const result = await query<City>(
      `SELECT c.*, r.name as region_name 
       FROM cities c 
       LEFT JOIN regions r ON c.region_id = r.id 
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(filters?: CityFilters): Promise<City[]> {
    let sql = `SELECT c.*, r.name as region_name FROM cities c LEFT JOIN regions r ON c.region_id = r.id WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.region_id) {
      sql += ` AND c.region_id = $${paramCount++}`;
      params.push(filters.region_id);
    }

    if (filters?.search) {
      sql += ` AND (c.name ILIKE $${paramCount++} OR c.country ILIKE $${paramCount++} OR c.description ILIKE $${paramCount++})`;
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters?.min_rating) {
      sql += ` AND c.rating >= $${paramCount++}`;
      params.push(filters.min_rating);
    }

    sql += ' ORDER BY c.name ASC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await query<City>(sql, params);
    return result.rows;
  }

  async create(data: CreateCityDTO): Promise<City> {
    const result = await query<City>(
      `INSERT INTO cities (name, country, region_id, description, image_url, best_time_to_visit, 
        average_cost_per_day, rating, latitude, longitude, timezone, currency, language) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        data.name,
        data.country,
        data.region_id,
        data.description,
        data.image_url,
        data.best_time_to_visit,
        data.average_cost_per_day,
        data.rating || 0,
        data.latitude,
        data.longitude,
        data.timezone,
        data.currency,
        data.language
      ]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateCityDTO): Promise<City | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(data.country);
    }
    if (data.region_id !== undefined) {
      fields.push(`region_id = $${paramCount++}`);
      values.push(data.region_id);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.best_time_to_visit !== undefined) {
      fields.push(`best_time_to_visit = $${paramCount++}`);
      values.push(data.best_time_to_visit);
    }
    if (data.average_cost_per_day !== undefined) {
      fields.push(`average_cost_per_day = $${paramCount++}`);
      values.push(data.average_cost_per_day);
    }
    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(data.rating);
    }
    if (data.latitude !== undefined) {
      fields.push(`latitude = $${paramCount++}`);
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      fields.push(`longitude = $${paramCount++}`);
      values.push(data.longitude);
    }
    if (data.timezone !== undefined) {
      fields.push(`timezone = $${paramCount++}`);
      values.push(data.timezone);
    }
    if (data.currency !== undefined) {
      fields.push(`currency = $${paramCount++}`);
      values.push(data.currency);
    }
    if (data.language !== undefined) {
      fields.push(`language = $${paramCount++}`);
      values.push(data.language);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query<City>(
      `UPDATE cities SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM cities WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllRegions(): Promise<Region[]> {
    const result = await query<Region>('SELECT * FROM regions ORDER BY name ASC');
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM cities');
    return parseInt(result.rows[0].count);
  }

  async getPopularCities(limit: number = 10): Promise<City[]> {
    const result = await query<City>(
      `SELECT c.*, r.name as region_name 
       FROM cities c 
       LEFT JOIN regions r ON c.region_id = r.id 
       ORDER BY c.rating DESC, c.name ASC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}
