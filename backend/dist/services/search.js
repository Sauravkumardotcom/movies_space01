import { prisma } from '../lib/prisma.js';
import logger from '../utils/logger.js';
// ============================================
// SEARCH SERVICE
// ============================================
export const searchService = {
    /**
     * Search movies, music, shorts
     */
    async search(query, type, page = 1, limit = 20) {
        try {
            if (!query || query.length < 2) {
                throw new Error('Query must be at least 2 characters');
            }
            const skip = (page - 1) * limit;
            const searchFilter = {
                OR: [{ title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }],
            };
            let results = [];
            let total = 0;
            if (!type || type === 'movie') {
                const [movies, movieCount] = await Promise.all([
                    prisma.movie.findMany({
                        where: searchFilter,
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            posterUrl: true,
                            releaseDate: true,
                        },
                    }),
                    prisma.movie.count({ where: searchFilter }),
                ]);
                results.push(...movies.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    type: 'movie',
                    posterUrl: m.posterUrl,
                    releaseDate: m.releaseDate,
                })));
                total += movieCount;
            }
            if (!type || type === 'music') {
                const [music, musicCount] = await Promise.all([
                    prisma.music.findMany({
                        where: searchFilter,
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            title: true,
                            artist: true,
                            coverUrl: true,
                            releaseDate: true,
                        },
                    }),
                    prisma.music.count({ where: searchFilter }),
                ]);
                results.push(...music.map((m) => ({
                    id: m.id,
                    title: m.title,
                    artist: m.artist,
                    type: 'music',
                    coverUrl: m.coverUrl,
                    releaseDate: m.releaseDate,
                })));
                total += musicCount;
            }
            if (!type || type === 'short') {
                const [shorts, shortCount] = await Promise.all([
                    prisma.short.findMany({
                        where: searchFilter,
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            thumbnailUrl: true,
                            createdAt: true,
                        },
                    }),
                    prisma.short.count({ where: searchFilter }),
                ]);
                results.push(...shorts.map((s) => ({
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    type: 'short',
                    thumbnailUrl: s.thumbnailUrl,
                    createdAt: s.createdAt,
                })));
                total += shortCount;
            }
            return {
                data: results,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error searching:', error);
            throw new Error(error.message || 'Failed to search');
        }
    },
    /**
     * Get trending movies
     */
    async getTrendingMovies(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [movies, total] = await Promise.all([
                prisma.movie.findMany({
                    skip,
                    take: limit,
                    orderBy: { views: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        posterUrl: true,
                        views: true,
                    },
                }),
                prisma.movie.count(),
            ]);
            return {
                data: movies,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching trending movies:', error);
            throw new Error(error.message || 'Failed to fetch trending');
        }
    },
    /**
     * Get trending music
     */
    async getTrendingMusic(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [music, total] = await Promise.all([
                prisma.music.findMany({
                    skip,
                    take: limit,
                    orderBy: { plays: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        artist: true,
                        coverUrl: true,
                        plays: true,
                    },
                }),
                prisma.music.count(),
            ]);
            return {
                data: music,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching trending music:', error);
            throw new Error(error.message || 'Failed to fetch trending');
        }
    },
    /**
     * Get recommended content (based on user's history + ratings)
     */
    async getRecommendations(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            // Get user's favorite genres/types from history
            const userHistory = await prisma.history.findMany({
                where: { userId },
                select: { entityType: true },
                take: 10,
            });
            const types = Array.from(new Set(userHistory.map((h) => h.entityType)));
            let recommendations = [];
            // Get top-rated items in user's watched types
            if (types.includes('movie')) {
                const topMovies = await prisma.movie.findMany({
                    skip,
                    take: Math.ceil(limit / types.length),
                    orderBy: { views: 'desc' },
                    select: { id: true, title: true, posterUrl: true },
                });
                recommendations.push(...topMovies.map((m) => ({ ...m, type: 'movie' })));
            }
            if (types.includes('music')) {
                const topMusic = await prisma.music.findMany({
                    skip,
                    take: Math.ceil(limit / types.length),
                    orderBy: { plays: 'desc' },
                    select: { id: true, title: true, coverUrl: true },
                });
                recommendations.push(...topMusic.map((m) => ({ ...m, type: 'music' })));
            }
            return {
                data: recommendations.slice(0, limit),
                total: recommendations.length,
                page,
                limit,
            };
        }
        catch (error) {
            logger.error('Error fetching recommendations:', error);
            throw new Error(error.message || 'Failed to fetch recommendations');
        }
    },
};
//# sourceMappingURL=search.js.map


