import { ICommunityRepository } from '../../domain/repositories/ICommunityRepository.js';
import { CommunityPostWithDetails, CreatePostDTO, UpdatePostDTO, PostFilters, CreateCommentDTO, FeaturedDestination } from '../../domain/entities/Community.js';

export class CommunityService {
  constructor(private communityRepository: ICommunityRepository) {}

  async getPostById(id: string, userId?: string): Promise<CommunityPostWithDetails | null> {
    return await this.communityRepository.findPostById(id, userId);
  }

  async getAllPosts(filters?: PostFilters, userId?: string): Promise<CommunityPostWithDetails[]> {
    return await this.communityRepository.findAllPosts(filters, userId);
  }

  async createPost(userId: string, data: CreatePostDTO): Promise<any> {
    return await this.communityRepository.createPost(userId, data);
  }

  async updatePost(id: string, data: UpdatePostDTO): Promise<any> {
    return await this.communityRepository.updatePost(id, data);
  }

  async deletePost(id: string): Promise<boolean> {
    return await this.communityRepository.deletePost(id);
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    return await this.communityRepository.likePost(postId, userId);
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    return await this.communityRepository.unlikePost(postId, userId);
  }

  async savePost(postId: string, userId: string): Promise<boolean> {
    return await this.communityRepository.savePost(postId, userId);
  }

  async unsavePost(postId: string, userId: string): Promise<boolean> {
    return await this.communityRepository.unsavePost(postId, userId);
  }

  async addComment(postId: string, userId: string, data: CreateCommentDTO): Promise<any> {
    return await this.communityRepository.addComment(postId, userId, data);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return await this.communityRepository.deleteComment(commentId);
  }

  async getFeaturedDestinations(): Promise<FeaturedDestination[]> {
    return await this.communityRepository.getFeaturedDestinations();
  }
}
