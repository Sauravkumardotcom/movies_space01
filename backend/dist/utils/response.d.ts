import { Response } from 'express';
import { ApiResponse } from '@types/api';
export declare function generateRequestId(): string;
export declare function createResponse<T>(statusCode: number, message: string, data?: T, errors?: Array<{
    field?: string;
    message: string;
    code?: string;
}>, requestId?: string): ApiResponse<T>;
export declare function sendResponse<T>(res: Response, statusCode: number, message: string, data?: T, errors?: Array<{
    field?: string;
    message: string;
    code?: string;
}>): Response;
export declare function handleError(error: unknown, statusCode?: number, fallbackMessage?: string): {
    statusCode: number;
    message: string;
    errors?: Array<{
        message: string;
    }>;
};
export declare class AppError extends Error {
    statusCode: number;
    errors?: Array<{
        field?: string;
        message: string;
        code?: string;
    }>;
    constructor(statusCode: number, message: string, errors?: Array<{
        field?: string;
        message: string;
        code?: string;
    }>);
}
//# sourceMappingURL=response.d.ts.map