import { db } from "@/db";
import { orderSchema } from "@/db/schema";
import { generateOrderId } from "@/utils/order-id-generator";
import { dnpayPaymentService } from "./dnpay-payment.service";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { logger } from "@/utils/logger";
import { OrderData, OrderCreationResponse } from "@/types";

const createOrder = async (orderData: OrderData): Promise<OrderCreationResponse> => {
    try {
        const orderId = generateOrderId();
        const newOrder = {
            id: orderId,
            email: orderData.email,
            tokenAddress: orderData.tokenAddress,
            amount: orderData.amount.toString(),
        };

        await db.insert(orderSchema).values(newOrder);

        const paymentAmount = 1000000; // TODO: calculate payment amount based on order amount and exchange rate
        const newPayment = await dnpayPaymentService.createPayment({
            orderId: orderId,
            appSessionId: orderData.appSessionId,
            currency: orderData.currency,
            amount: paymentAmount,
            metadata: {
                orderId: orderId,
                email: orderData.email,
                tokenAddress: orderData.tokenAddress,
                amount: orderData.amount.toString(),
            }
        });

        return {
            order: newOrder,
            payment: newPayment
        };
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