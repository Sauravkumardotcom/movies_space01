import { Router } from 'express';
import { searchService } from '../services/search.js';
import { sendResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
const router = Router();
// ============================================
// SEARCH ROUTES (Public)
// ============================================
/**
 * GET /api/v1/search
 * Search movies, music, shorts
 */
router.get('/', async (req, res) => {
    try {
        const { q, type, page = 1, limit = 20 } = req.query;
        if (!q) {
            return sendResponse(res, 400, 'Query parameter required');
        }
        const result = await searchService.search(q, type, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Search results fetched', result);
    }
    catch (error) {
        logger.error('Error searching:', error);
        sendResponse(res, 400, error.message || 'Failed to search');
    }
});
/**
 * GET /api/v1/search/trending/movies
 * Get trending movies
 */
router.get('/trending/movies', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await searchService.getTrendingMovies(parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Trending movies fetched', result);
    }
    catch (error) {
        logger.error('Error fetching trending movies:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch trending');
    }
});
/**
 * GET /api/v1/search/trending/music
 * Get trending music
 */
router.get('/trending/music', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await searchService.getTrendingMusic(parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Trending music fetched', result);
    }
    catch (error) {
        logger.error('Error fetching trending music:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch trending');
    }
});
/**
 * GET /api/v1/search/recommendations
 * Get recommended content (protected)
 */
router.get('/recommendations', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return sendResponse(res, 401, 'Authentication required');
        }
        const { page = 1, limit = 20 } = req.query;
        const result = await searchService.getRecommendations(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Recommendations fetched', result);
    }
    catch (error) {
        logger.error('Error fetching recommendations:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch recommendations');
    }
});
export default router;
//# sourceMappingURL=search.js.map