import { AppError } from "@/utils/app.error";
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ErrorCodes } from '@/common/constants/error-code';

export class TokenTransferException extends AppError {
    constructor(
        message: string = 'Token transfer error',
        status: ContentfulStatusCode = 500,
        errorCode: string = ErrorCodes.TOKEN_TRANSFER_ERROR
    ) {
        super(status, message, errorCode);
    }
}

export class TreasuryBalanceInsufficientException extends TokenTransferException {
    constructor(
        message: string = 'Treasury balance is insufficient',
        status: ContentfulStatusCode = 500,
        errorCode: string = ErrorCodes.TREASURY_BALANCE_INSUFFICIENT
    ) {
        super(message, status, errorCode);
    }
}