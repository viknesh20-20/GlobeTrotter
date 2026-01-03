import { ICommunityRepository } from '../../domain/repositories/ICommunityRepository.js';
import { CommunityPost, CommunityPostWithDetails, CreatePostDTO, UpdatePostDTO, PostFilters, CreateCommentDTO, PostComment, FeaturedDestination } from '../../domain/entities/Community.js';
import { query } from '../database/connection.js';

export class CommunityRepository implements ICommunityRepository {
  async findPostById(id: string, userId?: string): Promise<CommunityPostWithDetails | null> {
    const result = await query<CommunityPostWithDetails>(
      `SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as city_name,
        c.country,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id) as saves_count,
        ${userId ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2) as is_liked,` : 'false as is_liked,'}
        ${userId ? `EXISTS(SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = $2) as is_saved,` : 'false as is_saved,'}
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pc.id,
              'content', pc.content,
              'user_id', pc.user_id,
              'author_name', u2.full_name,
              'author_avatar', u2.avatar_url,
              'created_at', pc.created_at
            ) ORDER BY pc.created_at DESC
          )
          FROM post_comments pc
          LEFT JOIN users u2 ON pc.user_id = u2.id
          WHERE pc.post_id = p.id),
          '[]'::json
        ) as comments
       FROM community_posts p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN cities c ON p.city_id = c.id
       WHERE p.id = $1`,
      userId ? [id, userId] : [id]
    );
    return result.rows[0] || null;
  }

  async findAllPosts(filters?: PostFilters, userId?: string): Promise<CommunityPostWithDetails[]> {
    let sql = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as city_name,
        c.country,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id) as saves_count,
        ${userId ? `EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $${filters ? '2' : '1'}) as is_liked,` : 'false as is_liked,'}
        ${userId ? `EXISTS(SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = $${filters ? '2' : '1'}) as is_saved,` : 'false as is_saved,'}
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pc.id,
              'content', pc.content,
              'user_id', pc.user_id,
              'author_name', u2.full_name,
              'author_avatar', u2.avatar_url,
              'created_at', pc.created_at
            ) ORDER BY pc.created_at DESC
          )
          FROM post_comments pc
          LEFT JOIN users u2 ON pc.user_id = u2.id
          WHERE pc.post_id = p.id),
          '[]'::json
        ) as comments
       FROM community_posts p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN cities c ON p.city_id = c.id
       WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      params.push(userId);
      paramCount++;
    }

    if (filters?.city_id) {
      sql += ` AND p.city_id = $${paramCount++}`;
      params.push(filters.city_id);
    }

    if (filters?.user_id) {
      sql += ` AND p.user_id = $${paramCount++}`;
      params.push(filters.user_id);
    }

    sql += ' ORDER BY p.created_at DESC';

    if (filters?.limit) {
      sql += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await query<CommunityPostWithDetails>(sql, params);
    return result.rows;
  }

  async createPost(userId: string, data: CreatePostDTO): Promise<CommunityPost> {
    const result = await query<CommunityPost>(
      `INSERT INTO community_posts (user_id, city_id, title, content, images, trip_dates) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, data.city_id, data.title, data.content, data.images || [], data.trip_dates || null]
    );
    return result.rows[0];
  }

  async updatePost(id: string, data: UpdatePostDTO): Promise<CommunityPost | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(data.content);
    }
    if (data.images !== undefined) {
      fields.push(`images = $${paramCount++}`);
      values.push(data.images);
    }
    if (data.trip_dates !== undefined) {
      fields.push(`trip_dates = $${paramCount++}`);
      values.push(data.trip_dates);
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query<CommunityPost>(
      `UPDATE community_posts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await query('DELETE FROM community_posts WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      await query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async savePost(postId: string, userId: string): Promise<boolean> {
    try {
      await query(
        'INSERT INTO post_saves (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, userId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async unsavePost(postId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM post_saves WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addComment(postId: string, userId: string, data: CreateCommentDTO): Promise<PostComment> {
    const result = await query<PostComment>(
      `INSERT INTO post_comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [postId, userId, data.content]
    );
    return result.rows[0];
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await query('DELETE FROM post_comments WHERE id = $1', [commentId]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getFeaturedDestinations(): Promise<FeaturedDestination[]> {
    const result = await query<FeaturedDestination>(
      `SELECT 
        fd.*,
        c.name as city_name,
        c.country,
        c.image_url,
        c.description,
        c.rating
       FROM featured_destinations fd
       LEFT JOIN cities c ON fd.city_id = c.id
       ORDER BY fd.display_order ASC`,
      []
    );
    return result.rows;
  }
}
