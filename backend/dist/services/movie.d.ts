import type { PaginatedResponse } from '@types/api';
import type { MovieFilters } from '@types/validation';
export declare const movieService: {
    getMovies(filters: MovieFilters): Promise<PaginatedResponse<any>>;
    getMovieById(id: string): Promise<any>;
    getShorts(page: number, limit: number): Promise<PaginatedResponse<any>>;
    getGenres(): Promise<string[]>;
    getTrending(limit?: number): Promise<any[]>;
    incrementViewCount(id: string): Promise<void>;
    searchMovies(query: string, limit?: number): Promise<any[]>;
};
//# sourceMappingURL=movie.d.ts.map