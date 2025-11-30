interface PaymentMetadata {
    orderId: string;
    email: string;
    tokenAddress: string;
    amount: string;
}

export interface CreateDNPAYPaymentIntent {
    amount: number;
    currency: string;
    appSessionId: string;
    metadata: PaymentMetadata;
}

export interface DNPAYPaymentIntentResponse {
    id: string;
    amount: number;
    status: string;
    clientSecret: string;
    appSessionId: string;
    currency: string;
    metadata: PaymentMetadata;
    createdAt: string;
    expiresAt: string;
}