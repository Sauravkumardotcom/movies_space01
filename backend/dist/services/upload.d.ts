import { z } from 'zod';
declare const uploadCreateSchema: any;
declare const uploadStatusUpdateSchema: any;
export type UploadCreateInput = z.infer<typeof uploadCreateSchema>;
export type UploadStatusUpdateInput = z.infer<typeof uploadStatusUpdateSchema>;
export declare const uploadService: {
    validateFile(mimeType: string, fileSize: number): boolean;
    createUpload(userId: string, input: UploadCreateInput): Promise<any>;
    getUserUploads(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getUploadById(id: string, userId?: string): Promise<any>;
    updateUploadStatus(id: string, userId: string, input: UploadStatusUpdateInput): Promise<any>;
    deleteUpload(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    getUploadStats(userId: string): Promise<{
        total: any;
        processing: any;
        ready: any;
        failed: any;
        totalSize: any;
        totalSizeMB: number;
    }>;
    convertUploadToMusic(uploadId: string, userId: string, musicData: {
        title: string;
        artist: string;
        album?: string;
        genre: string;
        coverUrl?: string;
        streamUrl: string;
    }): Promise<any>;
};
export {};
//# sourceMappingURL=upload.d.ts.map