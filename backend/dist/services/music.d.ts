import { PaginatedResponse } from '@movies_space/shared';
import { z } from 'zod';
declare const musicFilterSchema: any;
declare const playlistCreateSchema: any;
declare const playlistUpdateSchema: any;
export type MusicFilters = z.infer<typeof musicFilterSchema>;
export type PlaylistCreateInput = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdateInput = z.infer<typeof playlistUpdateSchema>;
export declare const musicService: {
    getMusic(filters: MusicFilters): Promise<PaginatedResponse<any>>;
    getMusicById(id: string): Promise<any>;
    getTrending(limit?: number): Promise<any>;
    getArtists(): Promise<any>;
    getGenres(): Promise<any>;
    searchMusic(query: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    incrementPlayCount(id: string): Promise<void>;
    getUserPlaylists(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getPlaylistById(id: string): Promise<any>;
    createPlaylist(userId: string, input: PlaylistCreateInput): Promise<any>;
    updatePlaylist(id: string, userId: string, input: PlaylistUpdateInput): Promise<any>;
    deletePlaylist(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    addSongToPlaylist(playlistId: string, musicId: string, userId: string): Promise<{
        success: boolean;
    }>;
    removeSongFromPlaylist(playlistId: string, musicId: string, userId: string): Promise<{
        success: boolean;
    }>;
};
export {};
//# sourceMappingURL=music.d.ts.map