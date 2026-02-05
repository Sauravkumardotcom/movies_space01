import { Router } from 'express';
import { socialService } from '../services/social.js';
import { authMiddleware } from '../middleware/index.js';
import { sendResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
const router = Router();
// ============================================
// FOLLOW ROUTES (Protected)
// ============================================
/**
 * POST /api/v1/social/follow/:userId
 * Follow a user
 */
router.post('/follow/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;
        const follow = await socialService.followUser(currentUserId, userId);
        sendResponse(res, 201, 'User followed', follow);
    }
    catch (error) {
        logger.error('Error following user:', error);
        sendResponse(res, 400, error.message || 'Failed to follow user');
    }
});
/**
 * DELETE /api/v1/social/follow/:userId
 * Unfollow a user
 */
router.delete('/follow/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;
        await socialService.unfollowUser(currentUserId, userId);
        sendResponse(res, 200, 'User unfollowed');
    }
    catch (error) {
        logger.error('Error unfollowing user:', error);
        sendResponse(res, 400, error.message || 'Failed to unfollow user');
    }
});
/**
 * GET /api/v1/social/followers/:userId
 * Get user's followers
 */
router.get('/followers/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await socialService.getFollowers(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Followers fetched', result);
    }
    catch (error) {
        logger.error('Error fetching followers:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch followers');
    }
});
/**
 * GET /api/v1/social/following/:userId
 * Get user's following
 */
router.get('/following/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await socialService.getFollowing(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Following fetched', result);
    }
    catch (error) {
        logger.error('Error fetching following:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch following');
    }
});
/**
 * GET /api/v1/social/is-following/:userId
 * Check if following user
 */
router.get('/is-following/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;
        const isFollowing = await socialService.isFollowing(currentUserId, userId);
        sendResponse(res, 200, 'Check complete', { isFollowing });
    }
    catch (error) {
        logger.error('Error checking follow status:', error);
        sendResponse(res, 400, error.message || 'Failed to check follow status');
    }
});
/**
 * GET /api/v1/social/stats/:userId
 * Get follower stats
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await socialService.getFollowerStats(userId);
        sendResponse(res, 200, 'Stats fetched', stats);
    }
    catch (error) {
        logger.error('Error fetching stats:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch stats');
    }
});
// ============================================
// LIST ROUTES (Protected)
// ============================================
/**
 * POST /api/v1/social/lists
 * Create a list
 */
router.post('/lists', authMiddleware, async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        const userId = req.user.userId;
        const list = await socialService.createList(userId, {
            name,
            description,
            isPublic,
        });
        sendResponse(res, 201, 'List created', list);
    }
    catch (error) {
        logger.error('Error creating list:', error);
        sendResponse(res, 400, error.message || 'Failed to create list');
    }
});
/**
 * GET /api/v1/social/lists/:listId
 * Get list with items
 */
router.get('/lists/:listId', async (req, res) => {
    try {
        const { listId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await socialService.getList(listId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'List fetched', result);
    }
    catch (error) {
        logger.error('Error fetching list:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch list');
    }
});
/**
 * GET /api/v1/social/user-lists/:userId
 * Get user's lists
 */
router.get('/user-lists/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await socialService.getUserLists(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Lists fetched', result);
    }
    catch (error) {
        logger.error('Error fetching user lists:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch lists');
    }
});
/**
 * PUT /api/v1/social/lists/:listId
 * Update list
 */
router.put('/lists/:listId', authMiddleware, async (req, res) => {
    try {
        const { listId } = req.params;
        const { name, description, isPublic } = req.body;
        const userId = req.user.userId;
        const updated = await socialService.updateList(userId, listId, {
            name,
            description,
            isPublic,
        });
        sendResponse(res, 200, 'List updated', updated);
    }
    catch (error) {
        logger.error('Error updating list:', error);
        sendResponse(res, 400, error.message || 'Failed to update list');
    }
});
/**
 * DELETE /api/v1/social/lists/:listId
 * Delete list
 */
router.delete('/lists/:listId', authMiddleware, async (req, res) => {
    try {
        const { listId } = req.params;
        const userId = req.user.userId;
        await socialService.deleteList(userId, listId);
        sendResponse(res, 200, 'List deleted');
    }
    catch (error) {
        logger.error('Error deleting list:', error);
        sendResponse(res, 400, error.message || 'Failed to delete list');
    }
});
/**
 * POST /api/v1/social/lists/:listId/items
 * Add item to list
 */
router.post('/lists/:listId/items', authMiddleware, async (req, res) => {
    try {
        const { listId } = req.params;
        const { entityId, entityType } = req.body;
        const userId = req.user.userId;
        const item = await socialService.addItemToList(userId, listId, entityId, entityType);
        sendResponse(res, 201, 'Item added', item);
    }
    catch (error) {
        logger.error('Error adding item to list:', error);
        sendResponse(res, 400, error.message || 'Failed to add item');
    }
});
/**
 * DELETE /api/v1/social/lists/:listId/items/:entityId/:entityType
 * Remove item from list
 */
router.delete('/lists/:listId/items/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        const { listId, entityId, entityType } = req.params;
        const userId = req.user.userId;
        await socialService.removeItemFromList(userId, listId, entityId, entityType);
        sendResponse(res, 200, 'Item removed');
    }
    catch (error) {
        logger.error('Error removing item from list:', error);
        sendResponse(res, 400, error.message || 'Failed to remove item');
    }
});
export default router;
//# sourceMappingURL=social.js.map
