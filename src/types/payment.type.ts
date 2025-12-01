export type PaymentMetadata = {
    orderId: string;
    email: string;
    tokenAddress: string;
    amount: string;
}

export type PaymentData = {
    orderId: string;
    appSessionId: string;
    currency: string;
    amount: number;
    metadata: PaymentMetadata;
}

export type DNPAYPaymentIntentRequest = {
    amount: number;
    currency: string;
    appSessionId: string;
    metadata: PaymentMetadata;
}

export type DNPAYPaymentIntentResponse = {
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