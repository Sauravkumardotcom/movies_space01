export declare const config: {
    NODE_ENV: string;
    PORT: number;
    API_VERSION: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRY: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRY: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT: string;
    CORS_ORIGIN: string[];
    MAX_FILE_SIZE: number;
    ALLOWED_UPLOAD_TYPES: string[];
    FEATURE_FLAGS: {
        UPLOADS_ENABLED: boolean;
        OFFLINE_CACHE_ENABLED: boolean;
    };
};
export declare function validateConfig(): void;
//# sourceMappingURL=env.d.ts.map