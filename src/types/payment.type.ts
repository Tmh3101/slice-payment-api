export type PaymentMetadata = {
    orderId: string;
    email: string;
    userWalletAddress: string;
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

export type DNPAYPaymentResponse = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret: string;
    metadata: PaymentMetadata;
    createdAt: string;
    expiresAt: string;
}

export type DNPAYPaymentCreationRequest = {
    amount: number;
    currency: string;
    appSessionId: string;
    metadata: PaymentMetadata;
}

export type DNPAYPaymentCreationResponse = {
    appSessionId: string;
} & DNPAYPaymentResponse;

export type DNPAYPaymentConfirmationRequest = {
    paymentId: string;
    clientSecret: string;
}

export type DNPAYPaymentConfirmationResponse = {
    txHash: string;
} & DNPAYPaymentResponse;