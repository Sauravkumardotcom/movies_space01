import { v4 as uuidv4 } from 'uuid';
export function generateRequestId() {
    return uuidv4();
}
export function createResponse(statusCode, message, data, errors, requestId) {
    return {
        status: statusCode < 400 ? 'success' : 'error',
        statusCode,
        message,
        data,
        errors,
        requestId: requestId || generateRequestId(),
        timestamp: new Date().toISOString(),
    };
}
export function sendResponse(res, statusCode, message, data, errors) {
    const requestId = res.locals.requestId || generateRequestId();
    return res.status(statusCode).json(createResponse(statusCode, message, data, errors, requestId));
}
export function handleError(error, statusCode = 500, fallbackMessage = 'Internal server error') {
    if (error instanceof Error) {
        return {
            statusCode,
            message: error.message || fallbackMessage,
        };
    }
    return {
        statusCode,
        message: fallbackMessage,
    };
}
export class AppError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
//# sourceMappingURL=response.js.map