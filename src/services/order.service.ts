import { db } from "@/db";
import { orderSchema } from "@/db/schema";
import { generateOrderId } from "@/utils/order-id-generator";
import { dnpayPaymentService } from "./dnpay-payment.service";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { logger } from "@/utils/logger";
import { OrderData, OrderCreationResponse } from "@/types";
import { getPaymentAmount } from '@/utils/price-oracle';
import { RYF_TOKEN } from "@/common/constants/bsc-token";

const createOrder = async (orderData: OrderData): Promise<OrderCreationResponse> => {
    try {
        const orderId = generateOrderId();

        if (!orderData.tokenAddress) {
            orderData.tokenAddress = RYF_TOKEN.address;
        }

        const newOrder = {
            id: orderId,
            email: orderData.email,
            tokenAddress: orderData.tokenAddress,
            amount: orderData.amount.toString(),
        };

        const { formattedAmountIn: paymentAmount } = await getPaymentAmount(
            orderData.amount.toString(),
            orderData.currency
        );
        
        logger.info(`Calculated payment amount: ${paymentAmount} ${orderData.currency} for order ID: ${orderId}`);

        await db.insert(orderSchema).values(newOrder);
        
        const newPayment = await dnpayPaymentService.createPayment({
            orderId: orderId,
            appSessionId: orderData.appSessionId,
            currency: orderData.currency,
            amount: Number(paymentAmount),
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