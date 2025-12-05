import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { AppError } from '@/utils/app.error';
import { ErrorCodes } from '@/common/constants/error-code';
import { logger } from '@/utils/logger';

export const globalErrorHandler = (err: Error, c: Context) => {
    logger.error({ detail: err }, `[Error] ${c.req.method} ${c.req.path} >>`);

    // Xử lý lỗi ứng dụng tùy chỉnh
    if (err instanceof AppError) {
        return errorResponse({
            c,
            message: err.message,
            status: err.status,
            errorCode: err.errorCode,
            error: err
        });
    }

    // Xử lý lỗi mặc định của Hono (HTTPException)
    if (err instanceof HTTPException) {
        return errorResponse({
            c,
            message: err.message,
            status: err.status,
            errorCode: undefined,
            error: err
        });
    }

    // Xử lý lỗi Validate từ Zod
    if (err instanceof ZodError) {
        return errorResponse({
            c,
            message: err.message,
            status: 400,
            errorCode: ErrorCodes.VALIDATION_ERROR,
            error: err
        });
    }

    // Lỗi không xác định (Internal Server Error)
    return errorResponse({
        c,
        message: 'Internal Server Error',
        status: 500,
        errorCode: ErrorCodes.INTERNAL_ERROR,
        error: err
    });
};

// Handler cho route không tồn tại (404)
export const notFoundHandler = (c: Context) => {
    return errorResponse({
        c,
        message: `Route not found: ${c.req.path}`,
        status: 404,
        errorCode: ErrorCodes.ROUTE_NOT_FOUND
    });
};