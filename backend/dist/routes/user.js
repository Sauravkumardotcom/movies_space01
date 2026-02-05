import { Router } from 'express';
import { sendResponse } from './utils/response';
import { authMiddleware } from './middleware/index';
import { userActivityService } from './services/user-activity';
const router = Router();
// ============================================
// WATCHLIST ROUTES
// ============================================
/**
 * GET /api/v1/user/watchlist
 * Get user's watchlist
 */
router.get('/watchlist', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const result = await userActivityService.getWatchlist(req.user.userId, page, limit);
        sendResponse(res, 200, 'Watchlist retrieved', result);
    }
    catch (error) {
        console.error('Error fetching watchlist:', error);
        sendResponse(res, 500, 'Failed to fetch watchlist');
    }
});
/**
 * POST /api/v1/user/watchlist
 * Add movie to watchlist
 */
router.post('/watchlist', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const { movieId } = req.body;
        if (!movieId) {
            sendResponse(res, 400, 'movieId is required');
            return;
        }
        await userActivityService.addToWatchlist(req.user.userId, movieId);
        sendResponse(res, 201, 'Added to watchlist');
    }
    catch (error) {
        console.error('Error adding to watchlist:', error);
        sendResponse(res, 500, 'Failed to add to watchlist');
    }
});
/**
 * DELETE /api/v1/user/watchlist/:movieId
 * Remove movie from watchlist
 */
router.delete('/watchlist/:movieId', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        await userActivityService.removeFromWatchlist(req.user.userId, req.params.movieId);
        sendResponse(res, 200, 'Removed from watchlist');
    }
    catch (error) {
        console.error('Error removing from watchlist:', error);
        sendResponse(res, 500, 'Failed to remove from watchlist');
    }
});
// ============================================
// FAVORITES ROUTES
// ============================================
/**
 * GET /api/v1/user/favorites
 * Get user's favorites
 */
router.get('/favorites', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const favorites = await userActivityService.getFavorites(req.user.userId);
        sendResponse(res, 200, 'Favorites retrieved', favorites);
    }
    catch (error) {
        console.error('Error fetching favorites:', error);
        sendResponse(res, 500, 'Failed to fetch favorites');
    }
});
/**
 * POST /api/v1/user/favorites
 * Add to favorites
 */
router.post('/favorites', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const { entityId, entityType } = req.body;
        if (!entityId || !entityType) {
            sendResponse(res, 400, 'entityId and entityType are required');
            return;
        }
        await userActivityService.addToFavorites(req.user.userId, entityId, entityType);
        sendResponse(res, 201, 'Added to favorites');
    }
    catch (error) {
        console.error('Error adding to favorites:', error);
        sendResponse(res, 500, 'Failed to add to favorites');
    }
});
/**
 * DELETE /api/v1/user/favorites/:entityId/:entityType
 * Remove from favorites
 */
router.delete('/favorites/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        await userActivityService.removeFromFavorites(req.user.userId, req.params.entityId, req.params.entityType);
        sendResponse(res, 200, 'Removed from favorites');
    }
    catch (error) {
        console.error('Error removing from favorites:', error);
        sendResponse(res, 500, 'Failed to remove from favorites');
    }
});
// ============================================
// HISTORY ROUTES
// ============================================
/**
 * GET /api/v1/user/history
 * Get user's watch/play history
 */
router.get('/history', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const history = await userActivityService.getHistory(req.user.userId, limit);
        sendResponse(res, 200, 'History retrieved', history);
    }
    catch (error) {
        console.error('Error fetching history:', error);
        sendResponse(res, 500, 'Failed to fetch history');
    }
});
/**
 * POST /api/v1/user/history
 * Update playback progress
 */
router.post('/history', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const { entityId, entityType, progress, duration } = req.body;
        if (!entityId || !entityType || progress === undefined || !duration) {
            sendResponse(res, 400, 'Missing required fields');
            return;
        }
        await userActivityService.addToHistory(req.user.userId, entityId, entityType, progress, duration);
        sendResponse(res, 200, 'History updated');
    }
    catch (error) {
        console.error('Error updating history:', error);
        sendResponse(res, 500, 'Failed to update history');
    }
});
/**
 * DELETE /api/v1/user/history
 * Clear all history
 */
router.delete('/history', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        await userActivityService.clearHistory(req.user.userId);
        sendResponse(res, 200, 'History cleared');
    }
    catch (error) {
        console.error('Error clearing history:', error);
        sendResponse(res, 500, 'Failed to clear history');
    }
});
// ============================================
// RATINGS & REVIEWS ROUTES
// ============================================
/**
 * POST /api/v1/user/ratings
 * Submit a rating/review
 */
router.post('/ratings', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        const { entityId, entityType, rating, comment } = req.body;
        if (!entityId || !entityType || rating === undefined) {
            sendResponse(res, 400, 'Missing required fields');
            return;
        }
        const result = await userActivityService.addRating(req.user.userId, entityId, entityType, rating, comment);
        sendResponse(res, 201, 'Rating submitted', result);
    }
    catch (error) {
        if (error instanceof Error) {
            sendResponse(res, 400, error.message);
        }
        else {
            sendResponse(res, 500, 'Failed to submit rating');
        }
    }
});
/**
 * DELETE /api/v1/user/ratings/:entityId/:entityType
 * Delete a rating
 */
router.delete('/ratings/:entityId/:entityType', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.userId) {
            sendResponse(res, 401, 'Unauthorized');
            return;
        }
        await userActivityService.removeRating(req.user.userId, req.params.entityId, req.params.entityType);
        sendResponse(res, 200, 'Rating deleted');
    }
    catch (error) {
        console.error('Error deleting rating:', error);
        sendResponse(res, 500, 'Failed to delete rating');
    }
});
export default router;
//# sourceMappingURL=user.js.map