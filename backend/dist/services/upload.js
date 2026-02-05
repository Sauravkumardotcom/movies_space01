import { prisma } from '../config/db/index';
import { z } from 'zod';
import logger from '../../utils/logger.js';
// ============================================
// SCHEMAS
// ============================================
const uploadCreateSchema = z.object({
    title: z.string().min(1).max(200),
    duration: z.number().int().positive(),
    fileSize: z.number().int().positive(),
    mimeType: z.string(),
});
const uploadStatusUpdateSchema = z.object({
    status: z.enum(['processing', 'ready', 'failed']),
    streamUrl: z.string().optional(),
});
// ============================================
// CONSTANTS
// ============================================
const ALLOWED_MIME_TYPES = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/flac',
];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
// ============================================
// UPLOAD SERVICE
// ============================================
export const uploadService = {
    // Validate file before upload
    validateFile(mimeType, fileSize) {
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            throw new Error(`Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
        }
        if (fileSize > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds limit: ${(fileSize / 1024 / 1024).toFixed(2)}MB / ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`);
        }
        return true;
    },
    // Create upload record
    async createUpload(userId, input) {
        try {
            const validated = uploadCreateSchema.parse(input);
            // Validate file
            this.validateFile(validated.mimeType, validated.fileSize);
            const upload = await prisma.upload.create({
                data: {
                    userId,
                    title: validated.title,
                    duration: validated.duration,
                    fileSize: validated.fileSize,
                    mimeType: validated.mimeType,
                    status: 'processing',
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                },
            });
            return upload;
        }
        catch (error) {
            logger.error('Error in createUpload:', error);
            throw error;
        }
    },
    // Get user uploads
    async getUserUploads(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                prisma.upload.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        fileSize: true,
                        mimeType: true,
                        status: true,
                        streamUrl: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.upload.count({ where: { userId } }),
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
            logger.error('Error in getUserUploads:', error);
            throw error;
        }
    },
    // Get upload by id
    async getUploadById(id, userId) {
        try {
            const where = { id };
            if (userId)
                where.userId = userId;
            const upload = await prisma.upload.findUnique({
                where: { id },
                select: {
                    id: true,
                    userId: true,
                    title: true,
                    duration: true,
                    fileSize: true,
                    mimeType: true,
                    status: true,
                    streamUrl: true,
                    createdAt: true,
                },
            });
            if (!upload) {
                throw new Error(`Upload with id ${id} not found`);
            }
            return upload;
        }
        catch (error) {
            logger.error('Error in getUploadById:', error);
            throw error;
        }
    },
    // Update upload status (called after processing)
    async updateUploadStatus(id, userId, input) {
        try {
            const validated = uploadStatusUpdateSchema.parse(input);
            // Verify ownership
            const upload = await prisma.upload.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (!upload) {
                throw new Error(`Upload with id ${id} not found`);
            }
            if (upload.userId !== userId) {
                throw new Error('Unauthorized: Cannot update upload');
            }
            const updated = await prisma.upload.update({
                where: { id },
                data: {
                    status: validated.status,
                    streamUrl: validated.streamUrl,
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    streamUrl: true,
                    updatedAt: true,
                },
            });
            return updated;
        }
        catch (error) {
            logger.error('Error in updateUploadStatus:', error);
            throw error;
        }
    },
    // Delete upload
    async deleteUpload(id, userId) {
        try {
            // Verify ownership
            const upload = await prisma.upload.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (!upload) {
                throw new Error(`Upload with id ${id} not found`);
            }
            if (upload.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete upload');
            }
            await prisma.upload.delete({
                where: { id },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in deleteUpload:', error);
            throw error;
        }
    },
    // Get upload statistics
    async getUploadStats(userId) {
        try {
            const uploads = await prisma.upload.findMany({
                where: { userId },
                select: {
                    status: true,
                    fileSize: true,
                },
            });
            const stats = {
                total: uploads.length,
                processing: uploads.filter(u => u.status === 'processing').length,
                ready: uploads.filter(u => u.status === 'ready').length,
                failed: uploads.filter(u => u.status === 'failed').length,
                totalSize: uploads.reduce((acc, u) => acc + u.fileSize, 0),
                totalSizeMB: Number((uploads.reduce((acc, u) => acc + u.fileSize, 0) / 1024 / 1024).toFixed(2)),
            };
            return stats;
        }
        catch (error) {
            logger.error('Error in getUploadStats:', error);
            throw error;
        }
    },
    // Convert upload to music (when processing completes)
    async convertUploadToMusic(uploadId, userId, musicData) {
        try {
            // Verify ownership
            const upload = await prisma.upload.findUnique({
                where: { id: uploadId },
                select: { userId: true },
            });
            if (!upload) {
                throw new Error(`Upload with id ${uploadId} not found`);
            }
            if (upload.userId !== userId) {
                throw new Error('Unauthorized: Cannot convert upload');
            }
            // Create music record
            const music = await prisma.music.create({
                data: {
                    title: musicData.title,
                    artist: musicData.artist,
                    album: musicData.album,
                    genre: musicData.genre,
                    duration: (await this.getUploadById(uploadId, userId)).duration,
                    coverUrl: musicData.coverUrl,
                    streamUrl: musicData.streamUrl,
                    uploaderId: userId,
                },
                select: {
                    id: true,
                    title: true,
                    artist: true,
                    genre: true,
                    createdAt: true,
                },
            });
            // Update upload status to ready with stream URL
            await prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status: 'ready',
                    streamUrl: musicData.streamUrl,
                },
            });
            return music;
        }
        catch (error) {
            logger.error('Error in convertUploadToMusic:', error);
            throw error;
        }
    },
};
//# sourceMappingURL=upload.js.map
