import { AppError } from "@/utils/app.error";
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ErrorCodes } from '@/common/constants/error-code';

export class DNPAYException extends AppError {
    constructor(
        message: string = 'DNPAY related error',
        status: ContentfulStatusCode = 500,
        errorCode: string = ErrorCodes.DNPAY_ERROR
    ) {
        super(status, message, errorCode);
    }
}

export class AppSessionExpiredException extends DNPAYException {
    constructor(
        message: string = 'App session has expired',
        status: ContentfulStatusCode = 400,
        errorCode: string = ErrorCodes.APP_SESSION_EXPIRED
    ) {
        super(message, status, errorCode);
    }
}

export class InsufficientBalanceException extends DNPAYException {
    constructor(
        message: string = 'Insufficient balance',
        status: ContentfulStatusCode = 400,
        errorCode: string = ErrorCodes.INSUFFICIENT_BALANCE
    ) {
        super(message, status, errorCode);
    }
}