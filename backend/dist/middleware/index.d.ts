import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '@types/express';
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=index.d.ts.map