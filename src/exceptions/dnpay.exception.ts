import { AppError } from "@/utils/app.error";
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ErrorCodes } from '@/common/constants/error-code';

export class DNPAYException extends AppError {
    constructor(message: string, status: ContentfulStatusCode = 500, errorCode: string = ErrorCodes.DNPAY_ERROR) {
        super(status, message, errorCode);
    }
}