import dotenv from 'dotenv';
dotenv.config();
export const config = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_VERSION: process.env.API_VERSION || 'v1',
    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',
    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    // AWS S3
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'movies-space-media',
    S3_ENDPOINT: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
    // CORS
    CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    ALLOWED_UPLOAD_TYPES: (process.env.ALLOWED_UPLOAD_TYPES || 'audio/mpeg,audio/mp4,audio/wav,audio/ogg').split(','),
    // Features
    FEATURE_FLAGS: {
        UPLOADS_ENABLED: process.env.FEATURE_UPLOADS !== 'false',
        OFFLINE_CACHE_ENABLED: process.env.FEATURE_OFFLINE === 'true',
    },
};
export function validateConfig() {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = requiredVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
}
//# sourceMappingURL=env.js.map