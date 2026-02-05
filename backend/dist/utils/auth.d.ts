import type { AuthPayload, JwtTokens } from '@types/auth';
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function generateTokens(userId: string, email: string): JwtTokens;
export declare function verifyAccessToken(token: string): AuthPayload | null;
export declare function verifyRefreshToken(token: string): AuthPayload | null;
//# sourceMappingURL=auth.d.ts.map