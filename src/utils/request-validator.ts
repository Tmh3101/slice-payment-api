import { zValidator } from '@hono/zod-validator';
import { errorResponse } from './response.js';
import { ErrorCodes } from '@/common/constants/error-code';

export const validate = (target: 'json' | 'query' | 'param', schema: any) => {
    return zValidator(target, schema, (result, c) => {
        if (!result.success) {
            const message = result.error.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join('; ');
        
            return errorResponse({
                c,
                message,
                status: 400,
                errorCode: ErrorCodes.VALIDATION_ERROR
            });
        }
    });
};