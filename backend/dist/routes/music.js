import { Router } from 'express';
import { musicService } from '../services/music.js';
import { uploadService } from '../services/upload.js';
import { authMiddleware } from '../middleware/index.js';
import { sendResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
const router = Router();
// ============================================
// MUSIC DISCOVERY ROUTES
// ============================================
/**
 * GET /api/music
 * Get paginated music with optional filters
 * Query: artist?, genre?, page?, limit?
 */
router.get('/', async (req, res) => {
    try {
        const { artist, genre, page = 1, limit = 20 } = req.query;
        const result = await musicService.getMusic({
            artist: artist,
            genre: genre,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        sendResponse(res, 200, 'Music fetched successfully', result);
    }
    catch (error) {
        logger.error('Error in GET /:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch music');
    }
});
/**
 * GET /api/music/search
 * Search music by title, artist, or album
 * Query: q (required, min 2 chars), page?, limit?
 */
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        if (!q || q.length < 2) {
            return sendResponse(res, 400, 'Search query must be at least 2 characters');
        }
        const result = await musicService.searchMusic(q, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Search completed', result);
    }
    catch (error) {
        logger.error('Error in GET /search:', error);
        sendResponse(res, 400, error.message || 'Search failed');
    }
});
/**
 * GET /api/music/trending
 * Get trending music by play count
 * Query: limit?
 */
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const data = await musicService.getTrending(parseInt(limit) || 10);
        sendResponse(res, 200, 'Trending music fetched', { data });
    }
    catch (error) {
        logger.error('Error in GET /trending:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch trending');
    }
});
/**
 * GET /api/music/artists
 * Get list of all artists
 */
router.get('/artists', async (req, res) => {
    try {
        const data = await musicService.getArtists();
        sendResponse(res, 200, 'Artists fetched', { data });
    }
    catch (error) {
        logger.error('Error in GET /artists:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch artists');
    }
});
/**
 * GET /api/music/genres
 * Get list of all genres
 */
router.get('/genres', async (req, res) => {
    try {
        const data = await musicService.getGenres();
        sendResponse(res, 200, 'Genres fetched', { data });
    }
    catch (error) {
        logger.error('Error in GET /genres:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch genres');
    }
});
/**
 * GET /api/music/:id
 * Get single music with ratings
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const music = await musicService.getMusicById(id);
        // Increment play count asynchronously (non-blocking)
        musicService.incrementPlayCount(id).catch(err => logger.error('Error incrementing play count:', err));
        sendResponse(res, 200, 'Music fetched', music);
    }
    catch (error) {
        logger.error('Error in GET /:id:', error);
        sendResponse(res, 404, error.message || 'Music not found');
    }
});
// ============================================
// PLAYLIST ROUTES (Protected)
// ============================================
/**
 * GET /api/music/playlists
 * Get user's playlists
 * Query: page?, limit?
 */
router.get('/playlists', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await musicService.getUserPlaylists(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Playlists fetched', result);
    }
    catch (error) {
        logger.error('Error in GET /playlists:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch playlists');
    }
});
/**
 * POST /api/music/playlists
 * Create new playlist
 * Body: { title, description? }
 */
router.post('/playlists', authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId;
        const playlist = await musicService.createPlaylist(userId, {
            title,
            description,
        });
        sendResponse(res, 201, 'Playlist created', playlist);
    }
    catch (error) {
        logger.error('Error in POST /playlists:', error);
        sendResponse(res, 400, error.message || 'Failed to create playlist');
    }
});
/**
 * GET /api/music/playlists/:id
 * Get playlist details with all songs
 */
router.get('/playlists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await musicService.getPlaylistById(id);
        sendResponse(res, 200, 'Playlist fetched', playlist);
    }
    catch (error) {
        logger.error('Error in GET /playlists/:id:', error);
        sendResponse(res, 404, error.message || 'Playlist not found');
    }
});
/**
 * PUT /api/music/playlists/:id
 * Update playlist (title, description)
 */
router.put('/playlists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const userId = req.user.userId;
        const playlist = await musicService.updatePlaylist(id, userId, {
            title,
            description,
        });
        sendResponse(res, 200, 'Playlist updated', playlist);
    }
    catch (error) {
        logger.error('Error in PUT /playlists/:id:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
/**
 * DELETE /api/music/playlists/:id
 * Delete playlist
 */
router.delete('/playlists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        await musicService.deletePlaylist(id, userId);
        sendResponse(res, 200, 'Playlist deleted');
    }
    catch (error) {
        logger.error('Error in DELETE /playlists/:id:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
/**
 * POST /api/music/playlists/:id/songs
 * Add song to playlist
 * Body: { musicId }
 */
router.post('/playlists/:id/songs', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { musicId } = req.body;
        const userId = req.user.userId;
        await musicService.addSongToPlaylist(id, musicId, userId);
        sendResponse(res, 200, 'Song added to playlist');
    }
    catch (error) {
        logger.error('Error in POST /playlists/:id/songs:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
/**
 * DELETE /api/music/playlists/:id/songs/:musicId
 * Remove song from playlist
 */
router.delete('/playlists/:id/songs/:musicId', authMiddleware, async (req, res) => {
    try {
        const { id, musicId } = req.params;
        const userId = req.user.userId;
        await musicService.removeSongFromPlaylist(id, musicId, userId);
        sendResponse(res, 200, 'Song removed from playlist');
    }
    catch (error) {
        logger.error('Error in DELETE /playlists/:id/songs/:musicId:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
// ============================================
// UPLOAD ROUTES (Protected)
// ============================================
/**
 * POST /api/music/uploads
 * Create upload record
 * Body: { title, duration, fileSize, mimeType }
 */
router.post('/uploads', authMiddleware, async (req, res) => {
    try {
        const { title, duration, fileSize, mimeType } = req.body;
        const userId = req.user.userId;
        const upload = await uploadService.createUpload(userId, {
            title,
            duration,
            fileSize,
            mimeType,
        });
        sendResponse(res, 201, 'Upload initiated', upload);
    }
    catch (error) {
        logger.error('Error in POST /uploads:', error);
        sendResponse(res, 400, error.message || 'Failed to create upload');
    }
});
/**
 * GET /api/music/uploads
 * Get user's uploads
 * Query: page?, limit?
 */
router.get('/uploads', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;
        const result = await uploadService.getUserUploads(userId, parseInt(page) || 1, parseInt(limit) || 20);
        sendResponse(res, 200, 'Uploads fetched', result);
    }
    catch (error) {
        logger.error('Error in GET /uploads:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch uploads');
    }
});
/**
 * GET /api/music/uploads/:id
 * Get upload details
 */
router.get('/uploads/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const upload = await uploadService.getUploadById(id, userId);
        sendResponse(res, 200, 'Upload fetched', upload);
    }
    catch (error) {
        logger.error('Error in GET /uploads/:id:', error);
        sendResponse(res, 404, error.message || 'Upload not found');
    }
});
/**
 * PUT /api/music/uploads/:id/status
 * Update upload status (after processing)
 * Body: { status, streamUrl? }
 */
router.put('/uploads/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, streamUrl } = req.body;
        const userId = req.user.userId;
        const upload = await uploadService.updateUploadStatus(id, userId, {
            status,
            streamUrl,
        });
        sendResponse(res, 200, 'Upload status updated', upload);
    }
    catch (error) {
        logger.error('Error in PUT /uploads/:id/status:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
/**
 * DELETE /api/music/uploads/:id
 * Delete upload
 */
router.delete('/uploads/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        await uploadService.deleteUpload(id, userId);
        sendResponse(res, 200, 'Upload deleted');
    }
    catch (error) {
        logger.error('Error in DELETE /uploads/:id:', error);
        sendResponse(res, error.message.includes('Unauthorized') ? 403 : 400, error.message);
    }
});
/**
 * GET /api/music/uploads/stats
 * Get upload statistics
 */
router.get('/uploads/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = await uploadService.getUploadStats(userId);
        sendResponse(res, 200, 'Upload stats fetched', stats);
    }
    catch (error) {
        logger.error('Error in GET /uploads/stats:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch stats');
    }
});
export default router;
//# sourceMappingURL=music.js.map
