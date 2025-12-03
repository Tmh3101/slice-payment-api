import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderSchema, paymentSchema, OrderStatus } from "@/db/schema";
import { generateOrderId } from "@/utils/order-id-generator";
import { dnpayPaymentService } from "./dnpay-payment.service.js";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { logger } from "@/utils/logger";
import { OrderData, OrderCreationResponse } from "@/types";
import { getPaymentAmount } from '@/utils/price-oracle';
import { LENS_RYF_TOKEN } from "@/common/constants/lensChain-token";
import { AppVariables } from "@/types";

const createOrder = async (
    orderData: OrderData,
    user: AppVariables['user']
): Promise<OrderCreationResponse> => {
    try {
        const orderId = generateOrderId();

        if (!orderData.tokenAddress) {
            orderData.tokenAddress = LENS_RYF_TOKEN.address;
        }

        logger.debug({ detail: user }, 'Creating order for user:');

        const newOrder = {
            id: orderId,
            email: user.email,
            userWalletAddress: orderData.userWalletAddress,
            tokenAddress: orderData.tokenAddress,
            amount: orderData.amount.toString(),
        };

        const { formattedAmountIn: paymentAmount } = await getPaymentAmount(
            orderData.amount.toString(),
            orderData.currency
        );
        
        logger.info(
            `Calculated payment amount: ${paymentAmount} ${orderData.currency} for order ID: ${orderId}`
        );
        
        const { clientSecret, payment: newPayment } = await dnpayPaymentService.createPayment({
            orderId: orderId,
            appSessionId: orderData.appSessionId,
            currency: orderData.currency,
            amount: Number(paymentAmount),
            metadata: {
                orderId: orderId,
                email: user.email,
                userWalletAddress: orderData.userWalletAddress,
                tokenAddress: orderData.tokenAddress,
                amount: orderData.amount.toString(),
            }
        });

        const insertedOrder = await db.insert(orderSchema)
            .values(newOrder)
            .returning()
            .then(res => res[0]);

        const insertedPayment = await db.insert(paymentSchema)
            .values(newPayment)
            .returning()
            .then(res => res[0]);

        if (!insertedOrder || !insertedPayment) {
            throw new AppError(500, 'Failed to create order or payment record in the database');
        }

        return {
            order: insertedOrder,
            payment: {
                clientSecret,
                ...insertedPayment
            }
        };
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

const cancelOrder = async (orderId: string, user: AppVariables['user']) => {
    try {
        const order = await db.select()
            .from(orderSchema)
            .where(eq(orderSchema.id, orderId))
            .limit(1)
            .then(res => res[0]);

        if (!order) {
            throw new AppError(404, `Order with ID ${orderId} not found`);
        }

        if (order.email !== user.email) {
            throw new AppError(403, `You do not have permission to cancel this order`);
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new AppError(400, `Only pending orders can be cancelled`);
        }

        const updatedOrder = await db.update(orderSchema)
            .set({ status: OrderStatus.CANCELLED })
            .where(eq(orderSchema.id, orderId))
            .returning()
            .then(res => res[0]);

        return updatedOrder;
    } catch (error) {
        throw new AppError(500, `Failed to cancel order: ${(error as Error).message}`);
    }
};

export const orderService = {
    createOrder,
    cancelOrder
}