import { z } from 'zod';
export const SignupSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
});
export const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string(),
});
export const MovieFilterSchema = z.object({
    genre: z.string().optional(),
    year: z.number().optional(),
    type: z.enum(['movie', 'tv']).optional(),
    page: z.number().default(1),
    limit: z.number().default(20),
});
//# sourceMappingURL=validation.js.map
