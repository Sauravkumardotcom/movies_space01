import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from './config/env';
export function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function generateTokens(userId, email) {
    const accessToken = jwt.sign({ userId, email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId, email }, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRY });
    return { accessToken, refreshToken };
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, config.JWT_REFRESH_SECRET);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=auth.js.map
