import { Router } from 'express';
import { CommunityController } from '../controllers/CommunityController.js';
import { authenticate } from '../middleware/index.js';
import { CommunityService } from '../../application/use-cases/CommunityService.js';
import { CommunityRepository } from '../../infrastructure/repositories/CommunityRepository.js';

const router = Router();

const communityRepository = new CommunityRepository();
const communityService = new CommunityService(communityRepository);
const communityController = new CommunityController(communityService);

/**
 * @swagger
 * /api/community/posts:
 *   get:
 *     summary: Get all community posts
 *     tags: [Community]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of community posts
 */
router.get('/posts', communityController.getAllPosts);

/**
 * @swagger
 * /api/community/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/posts/:id', communityController.getPostById);

/**
 * @swagger
 * /api/community/featured:
 *   get:
 *     summary: Get featured destinations
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: List of featured destinations
 */
router.get('/featured', communityController.getFeaturedDestinations);

/**
 * @swagger
 * /api/community/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               city_id:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/posts', authenticate, communityController.createPost);

/**
 * @swagger
 * /api/community/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.put('/posts/:id', authenticate, communityController.updatePost);

/**
 * @swagger
 * /api/community/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete('/posts/:id', authenticate, communityController.deletePost);

/**
 * @swagger
 * /api/community/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/posts/:id/like', authenticate, communityController.likePost);

/**
 * @swagger
 * /api/community/posts/{id}/like:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete('/posts/:id/like', authenticate, communityController.unlikePost);

/**
 * @swagger
 * /api/community/posts/{id}/save:
 *   post:
 *     summary: Save a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post saved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/posts/:id/save', authenticate, communityController.savePost);

/**
 * @swagger
 * /api/community/posts/{id}/save:
 *   delete:
 *     summary: Unsave a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post unsaved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete('/posts/:id/save', authenticate, communityController.unsavePost);

/**
 * @swagger
 * /api/community/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/posts/:id/comments', authenticate, communityController.addComment);

/**
 * @swagger
 * /api/community/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete('/comments/:commentId', authenticate, communityController.deleteComment);

export default router;
