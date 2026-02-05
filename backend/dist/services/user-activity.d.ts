export declare const userActivityService: {
    addToWatchlist(userId: string, movieId: string): Promise<any>;
    removeFromWatchlist(userId: string, movieId: string): Promise<void>;
    getWatchlist(userId: string, page?: number, limit?: number): Promise<any>;
    addToFavorites(userId: string, entityId: string, entityType: string): Promise<any>;
    removeFromFavorites(userId: string, entityId: string, entityType: string): Promise<void>;
    getFavorites(userId: string): Promise<any>;
    addToHistory(userId: string, entityId: string, entityType: string, progress: number, duration: number): Promise<any>;
    getHistory(userId: string, limit?: number): Promise<any>;
    clearHistory(userId: string): Promise<void>;
    addRating(userId: string, entityId: string, entityType: string, rating: number, comment?: string): Promise<any>;
    removeRating(userId: string, entityId: string, entityType: string): Promise<void>;
    getRatings(entityId: string): Promise<any>;
    getUserRating(userId: string, entityId: string, entityType: string): Promise<any>;
};
//# sourceMappingURL=user-activity.d.ts.map