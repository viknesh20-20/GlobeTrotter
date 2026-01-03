import { CommunityPost, CommunityPostWithDetails, CreatePostDTO, UpdatePostDTO, PostFilters, CreateCommentDTO, PostComment, FeaturedDestination } from '../entities/Community.js';

export interface ICommunityRepository {
  // Posts
  findPostById(id: string, userId?: string): Promise<CommunityPostWithDetails | null>;
  findAllPosts(filters?: PostFilters, userId?: string): Promise<CommunityPostWithDetails[]>;
  createPost(userId: string, data: CreatePostDTO): Promise<CommunityPost>;
  updatePost(id: string, data: UpdatePostDTO): Promise<CommunityPost | null>;
  deletePost(id: string): Promise<boolean>;
  
  // Likes
  likePost(postId: string, userId: string): Promise<boolean>;
  unlikePost(postId: string, userId: string): Promise<boolean>;
  
  // Saves
  savePost(postId: string, userId: string): Promise<boolean>;
  unsavePost(postId: string, userId: string): Promise<boolean>;
  
  // Comments
  addComment(postId: string, userId: string, data: CreateCommentDTO): Promise<PostComment>;
  deleteComment(commentId: string): Promise<boolean>;
  
  // Featured
  getFeaturedDestinations(): Promise<FeaturedDestination[]>;
}
