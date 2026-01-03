import { Request, Response, NextFunction } from 'express';
import { CommunityService } from '../../application/use-cases/CommunityService.js';
import { AuthRequest } from '../middleware/auth.js';

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  getAllPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        city_id: req.query.city_id as string,
        user_id: req.query.user_id as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      const userId = req.user?.userId;
      const posts = await this.communityService.getAllPosts(filters, userId);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  };

  getPostById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const post = await this.communityService.getPostById(req.params.id, userId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const post = await this.communityService.createPost(req.user.userId, req.body);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingPost = await this.communityService.getPostById(req.params.id);
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingPost.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const post = await this.communityService.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const existingPost = await this.communityService.getPostById(req.params.id);
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Check ownership
      if (req.user.role !== 'admin' && existingPost.user_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await this.communityService.deletePost(req.params.id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  likePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.communityService.likePost(req.params.id, req.user.userId);
      res.json({ message: 'Post liked successfully' });
    } catch (error) {
      next(error);
    }
  };

  unlikePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.communityService.unlikePost(req.params.id, req.user.userId);
      res.json({ message: 'Post unliked successfully' });
    } catch (error) {
      next(error);
    }
  };

  savePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.communityService.savePost(req.params.id, req.user.userId);
      res.json({ message: 'Post saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  unsavePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await this.communityService.unsavePost(req.params.id, req.user.userId);
      res.json({ message: 'Post unsaved successfully' });
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const comment = await this.communityService.addComment(req.params.id, req.user.userId, req.body);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.communityService.deleteComment(req.params.commentId);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getFeaturedDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinations = await this.communityService.getFeaturedDestinations();
      res.json(destinations);
    } catch (error) {
      next(error);
    }
  };
}
