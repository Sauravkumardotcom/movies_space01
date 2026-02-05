import { prisma } from '../config/db/index';
import { z } from 'zod';
import logger from '../utils/logger/index';
// ============================================
// SCHEMAS
// ============================================
const musicFilterSchema = z.object({
    artist: z.string().optional(),
    genre: z.string().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(20),
});
const playlistCreateSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
});
const playlistUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
});
// ============================================
// MUSIC SERVICE
// ============================================
export const musicService = {
    // Get paginated music with filters
    async getMusic(filters) {
        try {
            const validated = musicFilterSchema.parse(filters);
            const skip = (validated.page - 1) * validated.limit;
            const where = {};
            if (validated.artist)
                where.artist = { contains: validated.artist, mode: 'insensitive' };
            if (validated.genre)
                where.genre = { contains: validated.genre, mode: 'insensitive' };
            const [data, total] = await Promise.all([
                prisma.music.findMany({
                    where,
                    skip,
                    take: validated.limit,
                    select: {
                        id: true,
                        title: true,
                        artist: true,
                        album: true,
                        genre: true,
                        duration: true,
                        coverUrl: true,
                        plays: true,
                        likes: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.music.count({ where }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page: validated.page,
                    limit: validated.limit,
                    pages: Math.ceil(total / validated.limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in getMusic:', error);
            throw error;
        }
    },
    // Get single music with full details
    async getMusicById(id) {
        try {
            const music = await prisma.music.findUnique({
                where: { id },
                select: {
                    id: true,
                    title: true,
                    artist: true,
                    album: true,
                    genre: true,
                    duration: true,
                    streamUrl: true,
                    coverUrl: true,
                    plays: true,
                    likes: true,
                    ratings: {
                        select: {
                            id: true,
                            userId: true,
                            score: true,
                            comment: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                    createdAt: true,
                },
            });
            if (!music) {
                throw new Error(`Music with id ${id} not found`);
            }
            return music;
        }
        catch (error) {
            logger.error('Error in getMusicById:', error);
            throw error;
        }
    },
    // Get trending music by plays
    async getTrending(limit = 10) {
        try {
            const trending = await prisma.music.findMany({
                take: limit,
                orderBy: { plays: 'desc' },
                select: {
                    id: true,
                    title: true,
                    artist: true,
                    genre: true,
                    duration: true,
                    coverUrl: true,
                    plays: true,
                    likes: true,
                },
            });
            return trending;
        }
        catch (error) {
            logger.error('Error in getTrending:', error);
            throw error;
        }
    },
    // Get artists list
    async getArtists() {
        try {
            const artists = await prisma.music.findMany({
                distinct: ['artist'],
                select: { artist: true },
                orderBy: { artist: 'asc' },
            });
            return artists.map(a => a.artist);
        }
        catch (error) {
            logger.error('Error in getArtists:', error);
            throw error;
        }
    },
    // Get genres list
    async getGenres() {
        try {
            const genres = await prisma.music.findMany({
                distinct: ['genre'],
                select: { genre: true },
                orderBy: { genre: 'asc' },
            });
            return genres.map(g => g.genre);
        }
        catch (error) {
            logger.error('Error in getGenres:', error);
            throw error;
        }
    },
    // Search music
    async searchMusic(query, page = 1, limit = 20) {
        try {
            if (query.length < 2) {
                throw new Error('Search query must be at least 2 characters');
            }
            const skip = (page - 1) * limit;
            const where = {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { artist: { contains: query, mode: 'insensitive' } },
                    { album: { contains: query, mode: 'insensitive' } },
                ],
            };
            const [data, total] = await Promise.all([
                prisma.music.findMany({
                    where,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        title: true,
                        artist: true,
                        album: true,
                        genre: true,
                        duration: true,
                        coverUrl: true,
                        plays: true,
                        likes: true,
                    },
                    orderBy: { plays: 'desc' },
                }),
                prisma.music.count({ where }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in searchMusic:', error);
            throw error;
        }
    },
    // Increment play count
    async incrementPlayCount(id) {
        try {
            await prisma.music.update({
                where: { id },
                data: { plays: { increment: 1 } },
            });
        }
        catch (error) {
            logger.error('Error in incrementPlayCount:', error);
            // Don't throw, just log as this is non-critical
        }
    },
    // ============================================
    // PLAYLIST OPERATIONS
    // ============================================
    // Get user playlists
    async getUserPlaylists(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                prisma.playlist.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        songs: {
                            select: {
                                id: true,
                                title: true,
                                artist: true,
                                duration: true,
                            },
                            take: 3, // Preview first 3 songs
                        },
                        _count: { select: { songs: true } },
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: { updatedAt: 'desc' },
                }),
                prisma.playlist.count({ where: { userId } }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in getUserPlaylists:', error);
            throw error;
        }
    },
    // Get playlist details with all songs
    async getPlaylistById(id) {
        try {
            const playlist = await prisma.playlist.findUnique({
                where: { id },
                select: {
                    id: true,
                    userId: true,
                    title: true,
                    description: true,
                    songs: {
                        select: {
                            id: true,
                            title: true,
                            artist: true,
                            album: true,
                            duration: true,
                            coverUrl: true,
                            streamUrl: true,
                            genre: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                    _count: { select: { songs: true } },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!playlist) {
                throw new Error(`Playlist with id ${id} not found`);
            }
            return playlist;
        }
        catch (error) {
            logger.error('Error in getPlaylistById:', error);
            throw error;
        }
    },
    // Create playlist
    async createPlaylist(userId, input) {
        try {
            const validated = playlistCreateSchema.parse(input);
            const playlist = await prisma.playlist.create({
                data: {
                    userId,
                    title: validated.title,
                    description: validated.description,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                },
            });
            return playlist;
        }
        catch (error) {
            logger.error('Error in createPlaylist:', error);
            throw error;
        }
    },
    // Update playlist
    async updatePlaylist(id, userId, input) {
        try {
            const validated = playlistUpdateSchema.parse(input);
            // Verify ownership
            const playlist = await prisma.playlist.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (!playlist) {
                throw new Error(`Playlist with id ${id} not found`);
            }
            if (playlist.userId !== userId) {
                throw new Error('Unauthorized: Cannot update playlist');
            }
            const updated = await prisma.playlist.update({
                where: { id },
                data: validated,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    updatedAt: true,
                },
            });
            return updated;
        }
        catch (error) {
            logger.error('Error in updatePlaylist:', error);
            throw error;
        }
    },
    // Delete playlist
    async deletePlaylist(id, userId) {
        try {
            // Verify ownership
            const playlist = await prisma.playlist.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (!playlist) {
                throw new Error(`Playlist with id ${id} not found`);
            }
            if (playlist.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete playlist');
            }
            await prisma.playlist.delete({
                where: { id },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in deletePlaylist:', error);
            throw error;
        }
    },
    // Add song to playlist
    async addSongToPlaylist(playlistId, musicId, userId) {
        try {
            // Verify ownership and existence
            const playlist = await prisma.playlist.findUnique({
                where: { id: playlistId },
                select: { userId: true },
            });
            if (!playlist) {
                throw new Error(`Playlist with id ${playlistId} not found`);
            }
            if (playlist.userId !== userId) {
                throw new Error('Unauthorized: Cannot modify playlist');
            }
            // Verify music exists
            const music = await prisma.music.findUnique({
                where: { id: musicId },
                select: { id: true },
            });
            if (!music) {
                throw new Error(`Music with id ${musicId} not found`);
            }
            // Add song (upsert to avoid duplicates)
            await prisma.playlist.update({
                where: { id: playlistId },
                data: {
                    songs: {
                        connect: { id: musicId },
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in addSongToPlaylist:', error);
            throw error;
        }
    },
    // Remove song from playlist
    async removeSongFromPlaylist(playlistId, musicId, userId) {
        try {
            // Verify ownership
            const playlist = await prisma.playlist.findUnique({
                where: { id: playlistId },
                select: { userId: true },
            });
            if (!playlist) {
                throw new Error(`Playlist with id ${playlistId} not found`);
            }
            if (playlist.userId !== userId) {
                throw new Error('Unauthorized: Cannot modify playlist');
            }
            await prisma.playlist.update({
                where: { id: playlistId },
                data: {
                    songs: {
                        disconnect: { id: musicId },
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in removeSongFromPlaylist:', error);
            throw error;
        }
    },
};
//# sourceMappingURL=music.js.map