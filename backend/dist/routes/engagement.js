import { Router } from 'express';
import { engagementService } from '../services/engagement';
import { authMiddleware } from '../middleware';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
const router = Router();
// ============================================
// RATINGS ROUTES (Protected)
// ============================================
/**
 * POST /api/engagement/ratings
 * Create or update rating
 * Body: { entityId, entityType, rating (1-5), comment? }
 */
router.post('/ratings', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType, rating, comment } = req.body;
        const userId = req.user.userId;
        const result = await engagementService.createRating(userId, {
            entityId,
            entityType,
            rating,
            comment,
        });
        sendResponse(res, 201, 'Rating created', result);
    }
    catch (error) {
        logger.error('Error in POST /ratings:', error);
        sendResponse(res, 400, error.message || 'Failed to create rating');
    }
});
/**
 * GET /api/engagement/ratings/:entityId/:entityType
 * Get user's rating for entity
 */
router.get('/ratings/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const userId = req.user.userId;
        const rating = await engagementService.getUserRating(userId, entityId, entityType);
        if (!rating) {
            return sendResponse(res, 404, 'No rating found');
        }
        sendResponse(res, 200, 'Rating fetched', rating);
    }
    catch (error) {
        logger.error('Error in GET /ratings/:entityId/:entityType:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch rating');
    }
});
/**
 * DELETE /api/engagement/ratings/:entityId/:entityType
 * Delete rating
 */
router.delete('/ratings/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const userId = req.user.userId;
        await engagementService.deleteRating(userId, entityId, entityType);
        sendResponse(res, 200, 'Rating deleted');
    }
    catch (error) {
        logger.error('Error in DELETE /ratings/:entityId/:entityType:', error);
        sendResponse(res, 400, error.message || 'Failed to delete rating');
    }
});
/**
 * GET /api/engagement/ratings/:entityId/:entityType/summary
 * Get ratings summary for entity (public)
 */
router.get('/ratings/:entityId/:entityType/summary', async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const summary = await engagementService.getEntityRatings(entityId, entityType);
        sendResponse(res, 200, 'Ratings summary fetched', summary);
    }
    catch (error) {
        logger.error('Error in GET /ratings/:entityId/:entityType/summary:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch ratings summary');
    }
});
// ============================================
// FAVORITES ROUTES (Protected)
// ============================================
/**
 * POST /api/engagement/favorites
 * Add to favorites
 * Body: { entityId, entityType }
 */
router.post('/favorites', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.body;
        const userId = req.user.userId;
        const result = await engagementService.addToFavorites(userId, {
            entityId,
            entityType,
        });
        sendResponse(res, 201, 'Added to favorites', result);
    }
    catch (error) {
        logger.error('Error in POST /favorites:', error);
        sendResponse(res, 400, error.message || 'Failed to add favorite');
    }
});
/**
 * GET /api/engagement/favorites
 * Get user's favorites
 * Query: entityType?, page?, limit?
 */
router.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const { entityType, page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await engagementService.getUserFavorites(userId, entityType, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Favorites fetched', result);
    }
    catch (error) {
        logger.error('Error in GET /favorites:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch favorites');
    }
});
/**
 * DELETE /api/engagement/favorites/:entityId/:entityType
 * Remove from favorites
 */
router.delete('/favorites/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const userId = req.user.userId;
        await engagementService.removeFromFavorites(userId, entityId, entityType);
        sendResponse(res, 200, 'Removed from favorites');
    }
    catch (error) {
        logger.error('Error in DELETE /favorites/:entityId/:entityType:', error);
        sendResponse(res, 400, error.message || 'Failed to remove favorite');
    }
});
/**
 * GET /api/engagement/favorites/:entityId/:entityType/check
 * Check if favorited
 */
router.get('/favorites/:entityId/:entityType/check', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const userId = req.user.userId;
        const isFavorited = await engagementService.isFavorited(userId, entityId, entityType);
        sendResponse(res, 200, 'Check complete', { isFavorited });
    }
    catch (error) {
        logger.error('Error in GET /favorites/:entityId/:entityType/check:', error);
        sendResponse(res, 400, error.message || 'Failed to check favorite');
    }
});
// ============================================
// WATCHLIST ROUTES (Protected)
// ============================================
/**
 * POST /api/engagement/watchlist
 * Add to watchlist
 * Body: { movieId }
 */
router.post('/watchlist', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.user.userId;
        const result = await engagementService.addToWatchlist(userId, {
            movieId,
        });
        sendResponse(res, 201, 'Added to watchlist', result);
    }
    catch (error) {
        logger.error('Error in POST /watchlist:', error);
        sendResponse(res, 400, error.message || 'Failed to add to watchlist');
    }
});
/**
 * GET /api/engagement/watchlist
 * Get user's watchlist
 * Query: page?, limit?
 */
router.get('/watchlist', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await engagementService.getUserWatchlist(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Watchlist fetched', result);
    }
    catch (error) {
        logger.error('Error in GET /watchlist:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch watchlist');
    }
});
/**
 * DELETE /api/engagement/watchlist/:movieId
 * Remove from watchlist
 */
router.delete('/watchlist/:movieId', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.userId;
        await engagementService.removeFromWatchlist(userId, movieId);
        sendResponse(res, 200, 'Removed from watchlist');
    }
    catch (error) {
        logger.error('Error in DELETE /watchlist/:movieId:', error);
        sendResponse(res, 400, error.message || 'Failed to remove from watchlist');
    }
});
/**
 * GET /api/engagement/watchlist/:movieId/check
 * Check if in watchlist
 */
router.get('/watchlist/:movieId/check', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.userId;
        const isInWatchlist = await engagementService.isInWatchlist(userId, movieId);
        sendResponse(res, 200, 'Check complete', { isInWatchlist });
    }
    catch (error) {
        logger.error('Error in GET /watchlist/:movieId/check:', error);
        sendResponse(res, 400, error.message || 'Failed to check watchlist');
    }
});
// ============================================
// HISTORY ROUTES (Protected)
// ============================================
/**
 * POST /api/engagement/history
 * Update watch history / add progress
 * Body: { entityId, entityType, progress, duration }
 */
router.post('/history', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType, progress, duration } = req.body;
        const userId = req.user.userId;
        const result = await engagementService.updateHistory(userId, {
            entityId,
            entityType,
            progress,
            duration,
        });
        sendResponse(res, 201, 'History updated', result);
    }
    catch (error) {
        logger.error('Error in POST /history:', error);
        sendResponse(res, 400, error.message || 'Failed to update history');
    }
});
/**
 * GET /api/engagement/history
 * Get user's watch history
 * Query: entityType?, page?, limit?
 */
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { entityType, page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await engagementService.getUserHistory(userId, entityType, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'History fetched', result);
    }
    catch (error) {
        logger.error('Error in GET /history:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch history');
    }
});
/**
 * GET /api/engagement/history/:entityId/:entityType
 * Get watch progress for specific entity
 */
router.get('/history/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        const { entityId, entityType } = req.params;
        const userId = req.user.userId;
        const progress = await engagementService.getWatchProgress(userId, entityId, entityType);
        if (!progress) {
            return sendResponse(res, 404, 'No history found');
        }
        sendResponse(res, 200, 'Progress fetched', progress);
    }
    catch (error) {
        logger.error('Error in GET /history/:entityId/:entityType:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch progress');
    }
});
// ============================================
// STATS ROUTES (Protected)
// ============================================
/**
 * GET /api/engagement/stats
 * Get user engagement statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = await engagementService.getUserEngagementStats(userId);
        sendResponse(res, 200, 'Stats fetched', stats);
    }
    catch (error) {
        logger.error('Error in GET /stats:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch stats');
    }
});
export default router;
//# sourceMappingURL=engagement.js.map