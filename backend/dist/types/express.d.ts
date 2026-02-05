import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
//# sourceMappingURL=express.d.ts.map