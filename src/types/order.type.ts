export type OrderData = {
    email: string;
    walletAddress: string;
    tokenAddress: string;
    amount: number;
    currency: string;
    appSessionId: string;
};

export type OrderCreationResponse = {
    order: any
    payment: any
};
