import { Router } from 'express';
import { sendResponse } from './utils/response';
import { movieService } from './services/movie';
import { MovieFilterSchema } from './types/validation';
const router = Router();
/**
 * GET /api/v1/movies
 * Get movies with filters and pagination
 */
router.get('/', async (req, res) => {
    try {
        const filters = MovieFilterSchema.safeParse({
            genre: req.query.genre,
            year: req.query.year ? parseInt(req.query.year) : undefined,
            type: req.query.type,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20,
        });
        if (!filters.success) {
            sendResponse(res, 400, 'Invalid filters');
            return;
        }
        const result = await movieService.getMovies(filters.data);
        sendResponse(res, 200, 'Movies retrieved', result);
    }
    catch (error) {
        console.error('Error fetching movies:', error);
        sendResponse(res, 500, 'Failed to fetch movies');
    }
});
/**
 * GET /api/v1/movies/genres
 * Get all available genres
 */
router.get('/genres', async (req, res) => {
    try {
        const genres = await movieService.getGenres();
        sendResponse(res, 200, 'Genres retrieved', genres);
    }
    catch (error) {
        console.error('Error fetching genres:', error);
        sendResponse(res, 500, 'Failed to fetch genres');
    }
});
/**
 * GET /api/v1/movies/trending
 * Get trending movies
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const movies = await movieService.getTrending(limit);
        sendResponse(res, 200, 'Trending movies retrieved', movies);
    }
    catch (error) {
        console.error('Error fetching trending:', error);
        sendResponse(res, 500, 'Failed to fetch trending');
    }
});
/**
 * GET /api/v1/movies/search
 * Search movies
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            sendResponse(res, 400, 'Search query must be at least 2 characters');
            return;
        }
        const results = await movieService.searchMovies(query);
        sendResponse(res, 200, 'Search results', results);
    }
    catch (error) {
        console.error('Error searching movies:', error);
        sendResponse(res, 500, 'Failed to search movies');
    }
});
/**
 * GET /api/v1/movies/:id
 * Get movie by ID with details and reviews
 */
router.get('/:id', async (req, res) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);
        if (!movie) {
            sendResponse(res, 404, 'Movie not found');
            return;
        }
        // Increment view count asynchronously
        movieService.incrementViewCount(req.params.id).catch(console.error);
        sendResponse(res, 200, 'Movie retrieved', movie);
    }
    catch (error) {
        console.error('Error fetching movie:', error);
        sendResponse(res, 500, 'Failed to fetch movie');
    }
});
/**
 * GET /api/v1/shorts
 * Get short-form videos with pagination
 */
router.get('/feed/shorts', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const result = await movieService.getShorts(page, limit);
        sendResponse(res, 200, 'Shorts retrieved', result);
    }
    catch (error) {
        console.error('Error fetching shorts:', error);
        sendResponse(res, 500, 'Failed to fetch shorts');
    }
});
export default router;
//# sourceMappingURL=movies.js.map