import { db } from "@/db";
import { orderSchema, paymentSchema } from "@/db/schema";
import { generateOrderId } from "@/utils/order-id-generator";
import { dnpayPaymentService } from "@/core/dnpay/dnpay-payment.service";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { logger } from "@/utils/logger";

export interface OrderData {
    email: string;
    tokenAddress: string;
    amount: number;
    currency: string;
    appSessionId: string;
}

const createOrder = async (orderData: OrderData) => {
    try {
        const orderId = generateOrderId();

        const newOrder = {
            id: orderId,
            email: orderData.email,
            tokenAddress: orderData.tokenAddress,
            amount: orderData.amount.toString(),
        };

        const paymentAmount = 1000000; // TODO: calculate payment amount based on order amount and exchange rate

        const paymentIntent = await dnpayPaymentService.createDNPAYPaymentIntent({
            amount: paymentAmount,
            currency: orderData.currency,
            appSessionId: orderData.appSessionId,
            metadata: {
                orderId: orderId,
                ...newOrder,
            }
        });

        const newPayment = {
            // id: paymentIntent.id,
            orderId: orderId,
            appSessionId: orderData.appSessionId,
            currency: orderData.currency,
            amount: paymentAmount.toString(),
            status: paymentIntent.status,
            clientSecret: paymentIntent.clientSecret,
            createdAt: new Date(paymentIntent.createdAt),
            expiresAt: new Date(paymentIntent.expiresAt),
        };

        await db.insert(orderSchema).values(newOrder);
        await db.insert(paymentSchema).values(newPayment);
    } catch (error) {
        logger.error({ detail: error }, 'Create Order Error:');
        if (error instanceof DNPAYException) {
            throw error;
        }
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

export const orderService = {
    createOrder,
}