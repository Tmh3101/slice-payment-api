import { AppError } from "@/utils/app.error";
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ErrorCodes } from '@/common/constants/error-code';

export class TreasuryBalanceInsufficientException extends AppError {
    constructor(
        message: string = 'Treasury balance is insufficient',
        status: ContentfulStatusCode = 500,
        errorCode: string = ErrorCodes.TREASURY_BALANCE_INSUFFICIENT
    ) {
        super(status, message, errorCode);
    }
}

export class TokenTransferFailedException extends AppError {
    constructor(
        message: string = 'Token transfer failed',
        status: ContentfulStatusCode = 500,
        errorCode: string = ErrorCodes.TOKEN_TRANSFER_FAILED
    ) {
        super(status, message, errorCode);
    }
}