import { AppError } from "@/utils/app.error";
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ErrorCodes } from '@/common/constants/error-code';

export class UnauthorizedException extends AppError {
    constructor(message: string = 'Unauthorized', status: ContentfulStatusCode = 401, errorCode: string = ErrorCodes.UNAUTHORIZED) {
        super(status, message, errorCode);
    }
}