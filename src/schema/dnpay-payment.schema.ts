import { z } from 'zod';

export const confirmDNPAYPaymentSchema = z.object({
    clientSecret: z.string().min(1),
});