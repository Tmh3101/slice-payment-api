import { z } from 'zod';

export const orderSchema = z.object({
    email: z.string().email(),
    tokenAddress: z.string().min(1).nullish(),
    amount: z.number().positive(),
    currency: z.string().min(1),
    appSessionId: z.string().uuid(),
});