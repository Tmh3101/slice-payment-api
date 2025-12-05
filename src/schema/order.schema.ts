import { z } from 'zod';
import { envConfig } from '@/config/env';

export const orderSchema = z.object({
    userWalletAddress: z.string().min(1).length(42),
    tokenAddress: z.string().min(1).nullish(),
    amount: z.number().positive().max(envConfig.MAX_TOKEN_PER_PAYMENT),
    currency: z.string().min(1),
    appSessionId: z.string().uuid(),
});