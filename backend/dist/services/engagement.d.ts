import { z } from 'zod';
declare const ratingCreateSchema: any;
declare const watchlistAddSchema: any;
declare const favoriteAddSchema: any;
declare const historyCreateSchema: any;
export type RatingCreateInput = z.infer<typeof ratingCreateSchema>;
export type WatchlistAddInput = z.infer<typeof watchlistAddSchema>;
export type FavoriteAddInput = z.infer<typeof favoriteAddSchema>;
export type HistoryCreateInput = z.infer<typeof historyCreateSchema>;
export declare const engagementService: {
    /**
     * Create or update rating
     */
    createRating(userId: string, input: RatingCreateInput): Promise<any>;
    /**
     * Get user rating for entity
     */
    getUserRating(userId: string, entityId: string, entityType: string): Promise<any>;
    /**
     * Delete rating
     */
    deleteRating(userId: string, entityId: string, entityType: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get entity ratings summary
     */
    getEntityRatings(entityId: string, entityType: string): Promise<{
        count: any;
        average: number;
        distribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }>;
    /**
     * Add to favorites
     */
    addToFavorites(userId: string, input: FavoriteAddInput): Promise<any>;
    /**
     * Remove from favorites
     */
    removeFromFavorites(userId: string, entityId: string, entityType: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get user's favorites
     */
    getUserFavorites(userId: string, entityType?: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Check if favorited
     */
    isFavorited(userId: string, entityId: string, entityType: string): Promise<boolean>;
    /**
     * Add to watchlist
     */
    addToWatchlist(userId: string, input: WatchlistAddInput): Promise<any>;
    /**
     * Remove from watchlist
     */
    removeFromWatchlist(userId: string, movieId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get user's watchlist
     */
    getUserWatchlist(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Check if in watchlist
     */
    isInWatchlist(userId: string, movieId: string): Promise<boolean>;
    /**
     * Add to history or update progress
     */
    updateHistory(userId: string, input: HistoryCreateInput): Promise<any>;
    /**
     * Get user's watch history
     */
    getUserHistory(userId: string, entityType?: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Get watch progress for entity
     */
    getWatchProgress(userId: string, entityId: string, entityType: string): Promise<{
        progress: any;
        duration: any;
        percentage: number;
        lastWatched: any;
    }>;
    /**
     * Get engagement stats for user
     */
    getUserEngagementStats(userId: string): Promise<{
        favorites: any;
        ratings: any;
        watchlist: any;
        historyEntries: any;
        totalMinutesWatched: number;
    }>;
};
export {};
//# sourceMappingURL=engagement.d.ts.map