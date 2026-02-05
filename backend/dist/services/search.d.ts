export declare const searchService: {
    /**
     * Search movies, music, shorts
     */
    search(query: string, type?: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get trending movies
     */
    getTrendingMovies(page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get trending music
     */
    getTrendingMusic(page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get recommended content (based on user's history + ratings)
     */
    getRecommendations(userId: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
};
//# sourceMappingURL=search.d.ts.map