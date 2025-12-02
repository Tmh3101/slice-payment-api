import { db } from "@/db";
import { paymentSchema } from "@/db/schema";
import { DNPAYException } from "@/exceptions/dnpay.exception";
import { AppError } from "@/utils/app.error";
import { dnpayService } from "@/core/dnpay/dnpay.service";
import { logger } from "@/utils/logger";
import { PaymentData } from "@/types";

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
            expiresAt: new Date(paymentIntent.expiresAt),
        };

        await db.insert(paymentSchema).values(newPayment);  
        return newPayment;
    } catch (error) {
        logger.error({ detail: error }, 'Create Payment Error:');
        if (error instanceof DNPAYException) {
            throw error;
        }
        throw new AppError(500, `Failed to create order: ${(error as Error).message}`);
    }
};

const confirmDNPAYPayment = async (paymentId: string) => {
    // TODO: Implement payment confirmation logic
};

export const dnpayPaymentService = {
    createPayment,
    confirmDNPAYPayment
};