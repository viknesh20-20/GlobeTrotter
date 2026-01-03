import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User, CreateUserDTO, UpdateUserDTO, UserPreferences, UpdateUserPreferencesDTO, UserWithPreferences } from '../../domain/entities/User.js';
import { query } from '../database/connection.js';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User & { password_hash: string }>(
      'SELECT id, email, password_hash, full_name, role, avatar_url, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const result = await query<User>(
      'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, avatar_url, created_at, updated_at`,
      [data.email, data.password_hash, data.full_name, data.role || 'traveler', data.avatar_url || null]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.full_name !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(data.full_name);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(data.avatar_url);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(data.role);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, full_name, role, avatar_url, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await query<UserPreferences>(
      'SELECT user_id, interests, budget_range, travel_style, accommodation_preference FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async updatePreferences(userId: string, data: UpdateUserPreferencesDTO): Promise<UserPreferences | null> {
    const existing = await this.getPreferences(userId);

    if (existing) {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.interests !== undefined) {
        fields.push(`interests = $${paramCount++}`);
        values.push(data.interests);
      }
      if (data.budget_range !== undefined) {
        fields.push(`budget_range = $${paramCount++}`);
        values.push(data.budget_range);
      }
      if (data.travel_style !== undefined) {
        fields.push(`travel_style = $${paramCount++}`);
        values.push(data.travel_style);
      }
      if (data.accommodation_preference !== undefined) {
        fields.push(`accommodation_preference = $${paramCount++}`);
        values.push(data.accommodation_preference);
      }

      if (fields.length === 0) return existing;

      values.push(userId);
      const result = await query<UserPreferences>(
        `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = $${paramCount} 
         RETURNING user_id, interests, budget_range, travel_style, accommodation_preference`,
        values
      );
      return result.rows[0] || null;
    } else {
      const result = await query<UserPreferences>(
        `INSERT INTO user_preferences (user_id, interests, budget_range, travel_style, accommodation_preference) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING user_id, interests, budget_range, travel_style, accommodation_preference`,
        [
          userId,
          data.interests || [],
          data.budget_range || 'moderate',
          data.travel_style || [],
          data.accommodation_preference || []
        ]
      );
      return result.rows[0];
    }
  }

  async getSavedDestinations(userId: string): Promise<string[]> {
    const result = await query<{ city_id: string }>(
      'SELECT city_id FROM saved_destinations WHERE user_id = $1 ORDER BY saved_at DESC',
      [userId]
    );
    return result.rows.map(row => row.city_id);
  }

  async saveDestination(userId: string, cityId: string): Promise<boolean> {
    try {
      await query(
        'INSERT INTO saved_destinations (user_id, city_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, cityId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async removeSavedDestination(userId: string, cityId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM saved_destinations WHERE user_id = $1 AND city_id = $2',
      [userId, cityId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async findByIdWithDetails(id: string): Promise<UserWithPreferences | null> {
    const result = await query<UserWithPreferences>(
      `SELECT 
        u.id, u.email, u.full_name, u.role, u.avatar_url, u.created_at, u.updated_at,
        up.interests, up.budget_range, up.travel_style, up.accommodation_preference,
        COALESCE(
          (SELECT json_agg(sd.city_id) FROM saved_destinations sd WHERE sd.user_id = u.id),
          '[]'::json
        ) as saved_destinations
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async count(): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }
}
