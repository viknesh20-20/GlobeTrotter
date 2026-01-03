// Community Types - matches database schema
export interface CommunityPost {
  id: string;
  user_id: string;
  city_id?: string;
  title: string;
  content: string;
  images: string[];
  trip_dates?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
  content: string;
  created_at: Date;
}

export interface PostCommentWithUser extends PostComment {
  user_name: string;
  user_avatar?: string;
}

export interface CommunityPostWithDetails extends CommunityPost {
  author_name?: string;
  author_avatar?: string;
  city_name?: string;
  country?: string;
  likes_count: number;
  saves_count: number;
  is_liked: boolean;
  is_saved: boolean;
  comments: PostComment[];
}

export interface FeaturedDestination {
  id: string;
  city_id: string;
  city_name?: string;
  country?: string;
  image_url?: string;
  description?: string;
  rating?: number;
  display_order: number;
  reason?: string;
}

// Create/Update DTOs
export interface CreatePostDTO {
  city_id?: string;
  title: string;
  content: string;
  images?: string[];
  trip_dates?: string;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  images?: string[];
  trip_dates?: string;
}

export interface CreateCommentDTO {
  content: string;
}

// Filters
export interface PostFilters {
  city_id?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
}
