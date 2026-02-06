import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  // Database - REQUIRED, no defaults
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT - REQUIRED
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRY: process.env.JWT_EXPIRY || process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || process.env.JWT_REFRESH_EXPIRE || '7d',

  // AWS S3
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'movies-space-media',
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',

  // CORS - Split by comma and trim whitespace
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()),

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
  ALLOWED_UPLOAD_TYPES: (process.env.ALLOWED_UPLOAD_TYPES || 'audio/mpeg,audio/mp4,audio/wav,audio/ogg').split(','),

  // Features
  FEATURE_FLAGS: {
    UPLOADS_ENABLED: process.env.FEATURE_UPLOADS !== 'false',
    OFFLINE_CACHE_ENABLED: process.env.FEATURE_OFFLINE === 'true',
  },
};

export function validateConfig(): void {
  const requiredVars: (keyof typeof config)[] = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter((key) => {
    const value = config[key];
    return !value || (typeof value === 'string' && value.trim() === '');
  });

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
