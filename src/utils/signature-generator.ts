import crypto from 'crypto';
import { envConfig } from '@/config/env';

export interface HmacSignatureParams {
    body: any;
    method: string;
    nonce: string;
    timestamp: string;
}

export const generateHmacSignature = ({ body, method, nonce, timestamp }: HmacSignatureParams) => {
    if (!envConfig.DNPAY_API_SECRET) {
        throw new Error('API_SECRET is not configured. Set API_SECRET in environment variables.');
    }
    const bodyString = method === "GET" ? "" : JSON.stringify(body);
    const payload = bodyString + timestamp + nonce;
    return crypto
        .createHmac('sha256', envConfig.DNPAY_API_SECRET)
        .update(payload)
        .digest('hex');
}