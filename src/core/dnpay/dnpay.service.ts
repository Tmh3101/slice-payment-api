import { httpClient } from "@/lib/http-client";
import { envConfig } from "@/config/env";
import { logger } from "@/utils/logger";
import { generateHmacSignature } from "@/utils/signature-generator";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import {
    DNPAYPaymentCreationRequest,
    DNPAYPaymentCreationResponse,
    DNPAYPaymentConfirmationRequest,
    DNPAYPaymentResponse
} from "@/types";

const getPaymentIntentById = async (paymentId: string): Promise<DNPAYPaymentResponse> => {
    try {
        const response =
            await makeDNPAYPaymentRequest<DNPAYPaymentResponse>(
                `/v1/payment_intents/${paymentId}`,
                'GET'
            );
        return response;
    } catch (error: any) {
        logger.error({ detail: error }, 'DNPAY Get Payment Intent Error:');
        throw new DNPAYException(error.message);
    }
};

const createDNPAYPaymentIntent =async (
    payload: DNPAYPaymentCreationRequest,
): Promise<DNPAYPaymentCreationResponse> => {
    try {
        const response =
            await makeDNPAYPaymentRequest<DNPAYPaymentCreationResponse>(
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

const confirmDNPAYPayment = async (
    payload: DNPAYPaymentConfirmationRequest
): Promise<DNPAYPaymentResponse> => {
    try {
        const { paymentId, clientSecret } = payload;
        const response =
            await makeDNPAYPaymentRequest<DNPAYPaymentResponse>(
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

        const timestamp = Math.floor(Date.now() / 1000).toString();
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

        logger.info({ detail: { endpoint, method, body, headers } }, 'DNPAY Payment Request:');

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
    getPaymentIntentById,
    createDNPAYPaymentIntent,
    confirmDNPAYPayment
};