import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentSchema, orderSchema, OrderStatus } from "@/db/schema";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { dnpayService } from "@/core/dnpay/dnpay.service";
import { logger } from "@/utils/logger";
import { PaymentData } from "@/types";
import { DNPAY_PAYMENT_STATUS } from "@/common/constants/dnpay-payment-status";

const getPaymentIntentById = async (paymentId: string) => {
    try {
        const paymentIntent = await dnpayService.getPaymentIntentById(paymentId);
        return paymentIntent;
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        logger.error({ detail: error }, 'Get Payment Intent Error:');
        throw new AppError(500, `Failed to get payment intent: ${(error as Error).message}`);
    }
};

const createPayment = async (paymentData: PaymentData) => {
    try {
        const paymentIntent = await dnpayService.createDNPAYPaymentIntent({
            amount: paymentData.amount,
            currency: paymentData.currency,
            appSessionId: paymentData.appSessionId,
            metadata: {
                ...paymentData.metadata,
                orderId: paymentData.orderId,
            }
        });

        logger.info({ detail: paymentIntent }, 'DNPAY Payment Intent Created:');

        const newPayment = {
            id: paymentIntent.id,
            orderId: paymentData.orderId,
            appSessionId: paymentData.appSessionId,
            currency: paymentData.currency,
            amount: paymentData.amount.toString(),
            status: paymentIntent.status,
            clientSecret: paymentIntent.clientSecret,
            createdAt: new Date(paymentIntent.createdAt),
            expiresAt: new Date(
                new Date(paymentIntent.createdAt).getTime() + 60 * 60 * 1000
            ), // assuming 1 hour expiry , TODO: get from paymentIntent if available
        };

        await db.insert(paymentSchema).values(newPayment);  
        return newPayment;
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        logger.error({ detail: error }, 'Create Payment Error:');
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

const confirmDNPAYPayment = async (paymentId: string, payload: any) => {
    try {
        const payment = await db.select()
            .from(paymentSchema)
            .where(eq(paymentSchema.id, paymentId))
            .limit(1)
            .then(res => res[0]);

        if (!payment) {
            throw new AppError(404, `Payment with ID ${paymentId} not found`);
        }

        const confirmationResponse = await dnpayService.confirmDNPAYPayment({
            paymentId: payment.id,
            clientSecret: payload.clientSecret
        });

        logger.info({ detail: confirmationResponse }, 'DNPAY Payment Confirmed:');

        if (confirmationResponse.status === DNPAY_PAYMENT_STATUS.SUCCEEDED) {
            logger.info({ detail: { status: confirmationResponse.status } }, `Payment ${paymentId} confirmed successfully.`);
            await db.update(paymentSchema)
                .set({ status: confirmationResponse.status })
                .where(eq(paymentSchema.id, paymentId));

            await db.update(orderSchema)
                .set({ status: OrderStatus.COMPLETED })
                .where(eq(orderSchema.id, payment.orderId));
        }

        return confirmationResponse;
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        logger.error({ detail: error }, 'Confirm Payment Error:');
        throw new AppError(500, `Failed to confirm payment: ${(error as Error).message}`);
    }
};

export const dnpayPaymentService = {
    getPaymentIntentById,
    createPayment,
    confirmDNPAYPayment
};