export interface AuthPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}
export interface JwtTokens {
    accessToken: string;
    refreshToken?: string;
}
//# sourceMappingURL=auth.d.ts.map