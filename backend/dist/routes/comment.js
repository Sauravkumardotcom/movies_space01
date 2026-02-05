import { Router } from 'express';
import { commentService } from '../services/comment.js';
import { authMiddleware } from '../middleware/index.js';
import { sendResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
const router = Router();
// ============================================
// COMMENTS ROUTES (Protected)
// ============================================
/**
 * POST /api/v1/comments
 * Create a comment
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType, content, rating } = req.body;
        const userId = req.user.userId;
        const comment = await commentService.createComment(userId, {
            entityId,
            entityType,
            content,
            rating,
        });
        sendResponse(res, 201, 'Comment created', comment);
    }
    catch (error) {
        logger.error('Error creating comment:', error);
        sendResponse(res, 400, error.message || 'Failed to create comment');
    }
});
/**
 * GET /api/v1/comments/:entityId/:entityType
 * Get comments for entity
 */
router.get('/:entityId/:entityType', async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user?.userId;
        const result = await commentService.getEntityComments(entityId, entityType, parseInt(page) || 1, parseInt(limit) || 20, userId);
        sendResponse(res, 200, 'Comments fetched', result);
    }
    catch (error) {
        logger.error('Error fetching comments:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch comments');
    }
});
/**
 * GET /api/v1/comments/:commentId/replies
 * Get replies for comment
 */
router.get('/:commentId/replies', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const result = await commentService.getCommentReplies(commentId, parseInt(page) || 1, parseInt(limit) || 10);
        sendResponse(res, 200, 'Replies fetched', result);
    }
    catch (error) {
        logger.error('Error fetching replies:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch replies');
    }
});
/**
 * POST /api/v1/comments/:commentId/reply
 * Reply to comment
 */
router.post('/:commentId/reply', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const reply = await commentService.replyToComment(userId, commentId, content);
        sendResponse(res, 201, 'Reply created', reply);
    }
    catch (error) {
        logger.error('Error replying to comment:', error);
        sendResponse(res, 400, error.message || 'Failed to reply');
    }
});
/**
 * PUT /api/v1/comments/:commentId
 * Update comment
 */
router.put('/:commentId', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const updated = await commentService.updateComment(userId, commentId, { content });
        sendResponse(res, 200, 'Comment updated', updated);
    }
    catch (error) {
        logger.error('Error updating comment:', error);
        sendResponse(res, 400, error.message || 'Failed to update comment');
    }
});
/**
 * DELETE /api/v1/comments/:commentId
 * Delete comment
 */
router.delete('/:commentId', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;
        await commentService.deleteComment(userId, commentId);
        sendResponse(res, 200, 'Comment deleted');
    }
    catch (error) {
        logger.error('Error deleting comment:', error);
        sendResponse(res, 400, error.message || 'Failed to delete comment');
    }
});
/**
 * POST /api/v1/comments/:commentId/like
 * Like comment
 */
router.post('/:commentId/like', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;
        const like = await commentService.likeComment(userId, commentId);
        sendResponse(res, 201, 'Comment liked', like);
    }
    catch (error) {
        logger.error('Error liking comment:', error);
        sendResponse(res, 400, error.message || 'Failed to like comment');
    }
});
/**
 * DELETE /api/v1/comments/:commentId/like
 * Unlike comment
 */
router.delete('/:commentId/like', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;
        await commentService.unlikeComment(userId, commentId);
        sendResponse(res, 200, 'Comment unliked');
    }
    catch (error) {
        logger.error('Error unliking comment:', error);
        sendResponse(res, 400, error.message || 'Failed to unlike comment');
    }
});
/**
 * GET /api/v1/comments/:commentId/likes
 * Get comment likes count
 */
router.get('/:commentId/likes', async (req, res) => {
    try {
        const { commentId } = req.params;
        const count = await commentService.getCommentLikesCount(commentId);
        sendResponse(res, 200, 'Likes count fetched', { count });
    }
    catch (error) {
        logger.error('Error fetching likes count:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch likes count');
    }
});
/**
 * GET /api/v1/comments/user/my-comments
 * Get user's comments
 */
router.get('/user/my-comments', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await commentService.getUserComments(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'User comments fetched', result);
    }
    catch (error) {
        logger.error('Error fetching user comments:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch comments');
    }
});
export default router;
//# sourceMappingURL=comment.js.map
