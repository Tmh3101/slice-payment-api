import { db } from "@/db";
import { orderSchema, paymentSchema } from "@/db/schema";
import { generateOrderId } from "@/utils/order-id-generator";
import { dnpayPaymentService } from "./dnpay-payment.service";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { logger } from "@/utils/logger";
import { OrderData, OrderCreationResponse } from "@/types";
import { getPaymentAmount } from '@/utils/price-oracle';
import { RYF_TOKEN } from "@/common/constants/bsc-token";
import { AppVariables } from "@/types";

const createOrder = async (
    orderData: OrderData,
    user: AppVariables['user']
): Promise<OrderCreationResponse> => {
    try {
        const orderId = generateOrderId();

        if (!orderData.tokenAddress) {
            orderData.tokenAddress = RYF_TOKEN.address;
        }

        console.log('Creating order for user:', user);

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

        await db.insert(orderSchema).values(newOrder);
        await db.insert(paymentSchema).values(newPayment); 

        return {
            order: newOrder,
            payment: {
                clientSecret,
                ...newPayment
            }
        };
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

export const orderService = {
    createOrder,
}