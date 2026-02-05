import { z } from 'zod';
export declare const SignupSchema: any;
export declare const LoginSchema: any;
export declare const MovieFilterSchema: any;
export type SignupPayload = z.infer<typeof SignupSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;
export type MovieFilters = z.infer<typeof MovieFilterSchema>;
//# sourceMappingURL=validation.d.ts.map