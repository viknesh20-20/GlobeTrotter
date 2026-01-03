import { IActivityRepository } from '../../domain/repositories/IActivityRepository.js';
import { Activity, CreateActivityDTO, UpdateActivityDTO, ActivityFilters, ActivityCategory } from '../../domain/entities/Activity.js';
import { query } from '../database/connection.js';

export class ActivityRepository implements IActivityRepository {
  async findById(id: string): Promise<Activity | null> {
    const result = await query<Activity>(
      `SELECT a.*, ac.name as category_name, ac.icon as category_icon 
       FROM activities a 
       LEFT JOIN activity_categories ac ON a.category_id = ac.id 
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(filters?: ActivityFilters): Promise<Activity[]> {
    let sql = `SELECT a.*, ac.name as category_name, ac.icon as category_icon 
               FROM activities a 
               LEFT JOIN activity_categories ac ON a.category_id = ac.id 
               WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.city_id) {
      sql += ` AND a.city_id = $${paramCount++}`;
      params.push(filters.city_id);
    }

    if (filters?.category_id) {
      sql += ` AND a.category_id = $${paramCount++}`;
      params.push(filters.category_id);
    }

    if (filters?.search) {
      sql += ` AND (a.name ILIKE $${paramCount++} OR a.description ILIKE $${paramCount++})`;
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (filters?.min_rating) {
      sql += ` AND a.rating >= $${paramCount++}`;
      params.push(filters.min_rating);
    }

    if (filters?.max_price) {
      sql += ` AND a.estimated_cost <= $${paramCount++}`;
      params.push(filters.max_price);
    }

    if (filters?.duration) {
      sql += ` AND a.duration = $${paramCount++}`;
      params.push(filters.duration);
    }

    sql += ' ORDER BY a.rating DESC, a.name ASC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await query<Activity>(sql, params);
    return result.rows;
  }

  async findByCityId(cityId: string): Promise<Activity[]> {
    return this.findAll({ city_id: cityId });
  }

  async create(data: CreateActivityDTO): Promise<Activity> {
    const result = await query<Activity>(
      `INSERT INTO activities (name, city_id, category_id, description, estimated_cost, 
        duration, rating, image_url, location, best_time, booking_required) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        data.name,
        data.city_id,
        data.category_id,
        data.description,
        data.estimated_cost,
        data.duration,
        data.rating || 0,
        data.image_url,
        data.location || null,
        data.best_time || null,
        data.booking_required || false
      ]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateActivityDTO): Promise<Activity | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.city_id !== undefined) {
      fields.push(`city_id = $${paramCount++}`);
      values.push(data.city_id);
    }
    if (data.category_id !== undefined) {
      fields.push(`category_id = $${paramCount++}`);
      values.push(data.category_id);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.estimated_cost !== undefined) {
      fields.push(`estimated_cost = $${paramCount++}`);
      values.push(data.estimated_cost);
    }
    if (data.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`);
      values.push(data.duration);
    }
    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(data.rating);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(data.image_url);
    }
    if (data.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(data.location);
    }
    if (data.best_time !== undefined) {
      fields.push(`best_time = $${paramCount++}`);
      values.push(data.best_time);
    }
    if (data.booking_required !== undefined) {
      fields.push(`booking_required = $${paramCount++}`);
      values.push(data.booking_required);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query<Activity>(
      `UPDATE activities SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM activities WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllCategories(): Promise<ActivityCategory[]> {
    const result = await query<ActivityCategory>('SELECT * FROM activity_categories ORDER BY name ASC');
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM activities');
    return parseInt(result.rows[0].count);
  }
}
