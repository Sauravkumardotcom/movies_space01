import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const movieService = {
    async getMovies(filters) {
        const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
        const take = filters.limit || 20;
        const where = {};
        if (filters.type)
            where.type = filters.type;
        if (filters.year)
            where.year = filters.year;
        if (filters.genre) {
            where.genre = {
                hasSome: [filters.genre],
            };
        }
        const [items, total] = await Promise.all([
            prisma.movie.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    posterUrl: true,
                    genre: true,
                    year: true,
                    director: true,
                    rating: true,
                    duration: true,
                    type: true,
                    viewCount: true,
                },
            }),
            prisma.movie.count({ where }),
        ]);
        return {
            items,
            total,
            page: filters.page || 1,
            limit: take,
            hasMore: skip + items.length < total,
        };
    },
    async getMovieById(id) {
        return prisma.movie.findUnique({
            where: { id },
            include: {
                episodes: {
                    orderBy: [{ season: 'asc' }, { episode: 'asc' }],
                },
                ratings: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
    },
    async getShorts(page, limit) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            prisma.short.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    videoUrl: true,
                    thumbnailUrl: true,
                    duration: true,
                    creatorId: true,
                    likes: true,
                    views: true,
                    createdAt: true,
                },
            }),
            prisma.short.count(),
        ]);
        return {
            items,
            total,
            page,
            limit,
            hasMore: skip + items.length < total,
        };
    },
    async getGenres() {
        const movies = await prisma.movie.findMany({
            select: { genre: true },
            distinct: ['genre'],
        });
        const genres = new Set();
        movies.forEach((m) => {
            m.genre.forEach((g) => genres.add(g));
        });
        return Array.from(genres).sort();
    },
    async getTrending(limit = 10) {
        return prisma.movie.findMany({
            where: { viewCount: { gt: 0 } },
            orderBy: { viewCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                posterUrl: true,
                genre: true,
                rating: true,
                type: true,
                viewCount: true,
            },
        });
    },
    async incrementViewCount(id) {
        await prisma.movie.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    },
    async searchMovies(query, limit = 20) {
        return prisma.movie.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { director: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: limit,
            select: {
                id: true,
                title: true,
                posterUrl: true,
                year: true,
                type: true,
            },
        });
    },
};
//# sourceMappingURL=movie.js.map

