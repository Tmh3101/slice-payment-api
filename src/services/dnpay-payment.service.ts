import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentSchema, orderSchema, OrderStatus } from "@/db/schema";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { dnpayService } from "@/core/dnpay/dnpay.service";
import { ryfTokenService } from "@/core/token/ryf-token.service";
import { logger } from "@/utils/logger";
import { PaymentData } from "@/types";
import { DNPAY_PAYMENT_STATUS } from "@/common/constants/dnpay-payment-status";
import { AppVariables } from "@/types";

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

        const newPayment = {
            id: paymentIntent.id,
            orderId: paymentData.orderId,
            appSessionId: paymentData.appSessionId,
            currency: paymentData.currency,
            amount: paymentData.amount.toString(),
            status: paymentIntent.status,
            createdAt: new Date(paymentIntent.createdAt),
            expiresAt: new Date(paymentIntent.expiresAt),
        };
 
        return {
            clientSecret: paymentIntent.clientSecret,
            payment: newPayment
        };
    } catch (error) {
        if (error instanceof DNPAYException) {
            throw error;
        }
        logger.error({ detail: error }, 'Create Payment Error:');
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

const confirmDNPAYPayment = async (paymentId: string, payload: any, user: AppVariables['user']) => {
    try {
        const payment = await db.select()
            .from(paymentSchema)
            .where(eq(paymentSchema.id, paymentId))
            .limit(1)
            .then(res => res[0]);

        if (!payment) {
            throw new AppError(404, `Payment with ID ${paymentId} not found`);
        }

        const order = await db.select()
            .from(orderSchema)
            .where(eq(orderSchema.id, payment.orderId))
            .limit(1)
            .then(res => res[0]);

        if (!order) {
            throw new AppError(404, `Order with ID ${payment.orderId} not found`);
        }

        if (order.email !== user.email) {
            throw new AppError(403, `You do not have permission to confirm this payment`);
        }

        if (payment.status === DNPAY_PAYMENT_STATUS.CANCELED) {
            throw new AppError(400, `Payment with ID ${paymentId} has been canceled`);
        }

        if (payment.status === DNPAY_PAYMENT_STATUS.SUCCEEDED) {
            throw new AppError(400, `Payment with ID ${paymentId} has already been confirmed`);
        }

        const confirmationResponse = await dnpayService.confirmDNPAYPayment({
            paymentId: payment.id,
            clientSecret: payload.clientSecret
        });

        if (confirmationResponse.status !== DNPAY_PAYMENT_STATUS.SUCCEEDED) {
            throw new AppError(400, `Payment confirmation failed for payment ID ${paymentId}`);
        }

        await db.update(paymentSchema)
            .set({ status: confirmationResponse.status })
            .where(eq(paymentSchema.id, paymentId));

        const transferData = await ryfTokenService.transferTokenToUser({
            orderId: order.id,
            amount: order.amount,
            toAddress: order.userWalletAddress as `0x${string}`
        });

        await db.update(orderSchema)
            .set({ status: OrderStatus.COMPLETED })
            .where(eq(orderSchema.id, payment.orderId));
            
        logger.info({ detail: { status: confirmationResponse.status } }, `Payment ${paymentId} confirmed successfully.`);

        return {
            ...confirmationResponse,
            txHash: transferData.txHash
        };
    } catch (error) {
        logger.error({ detail: error }, 'Confirm Payment Error:');
        throw error;
    }
};

export const dnpayPaymentService = {
    getPaymentIntentById,
    createPayment,
    confirmDNPAYPayment
};