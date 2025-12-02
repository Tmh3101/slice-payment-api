import { httpClient } from "@/lib/http-client";
import { envConfig } from "@/config/env";
import { logger } from "@/utils/logger";
import { generateHmacSignature } from "@/utils/signature-generator";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import {
    DNPAYPaymentIntentRequest,
    DNPAYPaymentIntentResponse,
    DNPAYPaymentConfirmationRequest,
    DNPAYPaymentConfirmationResponse
} from "@/types";

const createDNPAYPaymentIntent =async (
    payload: DNPAYPaymentIntentRequest
): Promise<DNPAYPaymentIntentResponse> => {
    try {
        const response =
            await makeDNPAYPaymentRequest<DNPAYPaymentIntentResponse>(
                '/v1/payment_intents',
                'POST',
                payload
            );
        return response;
    } catch (error: any) {
        logger.error({ detail: error }, 'DNPAY Payment Intent Creation Error:');
        throw new DNPAYException(error.message);
    }
};

const confirmDNPAYPayment = async ({
    paymentId,
    clientSecret
}: DNPAYPaymentConfirmationRequest
): Promise<DNPAYPaymentConfirmationResponse> => {
    try {
        const response =
            await makeDNPAYPaymentRequest<DNPAYPaymentConfirmationResponse>(
                `/v1/payment_intents/${paymentId}/confirm`,
                'POST',
                { clientSecret }
            );
        return response;
    } catch (error: any) {
        logger.error({ detail: error }, 'DNPAY Payment Confirmation Error:');
        throw new DNPAYException(error.message);
    }
};

const makeDNPAYPaymentRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
): Promise<T> => {
    try {
        if (!envConfig.DNPAY_API_KEY || !envConfig.DNPAY_API_SECRET || !envConfig.DNPAY_API_URL) {
            throw new Error(
                'DNPAY API environment variables are not properly configured.'
            );
        }

        const timestamp = Date.now().toString();
        const nonce = crypto.randomUUID();
        const signature = generateHmacSignature({
            body,
            method,
            nonce,
            timestamp
        });

        const headers = {
            'X-Api-Key': envConfig.DNPAY_API_KEY,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'Idempotency-Key': nonce,
        };

        logger.info({ endpoint, method, body, headers }, 'DNPAY Payment Request:');

        const response = await httpClient<T>(`${envConfig.DNPAY_API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        return response;
    } catch (error) {
        logger.error({ detail: error }, 'DNPAY Payment Request Error:');
        throw error;
    }
}

export const dnpayService = {
    createDNPAYPaymentIntent,
    confirmDNPAYPayment
};