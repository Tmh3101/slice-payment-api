import { db } from "@/db";
import { orderSchema, paymentSchema } from "@/db/schema";

import { generateOrderId } from "@/utils/order-id-generator";

const createOrder = async (orderData: any) => {
    const orderId = generateOrderId();

    const newOrder = {
        id: orderId,
        email: orderData.email,
        tokenAddress: orderData.tokenAddress,
        amount: orderData.amount,
    };

    const paymentAmount = 1000000; // TODO: calculate payment amount based on order amount and exchange rate

    const newPayment = {
        orderId: orderId,
        appSessionId: orderData.appSessionId,
        currency: orderData.currency,
        amount: paymentAmount.toString(),
    };

    await db.insert(orderSchema).values(newOrder);
    await db.insert(paymentSchema).values(newPayment);
};

export const orderService = {
    createOrder,
}