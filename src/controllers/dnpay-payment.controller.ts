import type { Context } from "hono";
import { dnpayPaymentService } from "@/services/dnpay-payment.service";
import { successResponse } from "@/utils/response";

const getPaymentIntentById = async (c: Context) => {
    const paymentId = c.req.param('id');
    const paymentIntent = await dnpayPaymentService.getPaymentIntentById(paymentId);
    return successResponse({
        c,
        message: 'DNPAY payment intent retrieved successfully',
        data: paymentIntent
    });
};

const confirmDNPAYPayment = async (c: Context) => {
    const paymentId = c.req.param('id');
    const payload = await c.req.json();
    const user = c.get('user');
    const confirmationResponse = await dnpayPaymentService.confirmDNPAYPayment(paymentId, payload, user);
    return successResponse({
        c,
        message: 'DNPAY payment confirmed successfully',
        data: confirmationResponse
    });
}

export const dnpayPaymentController = {
    getPaymentIntentById,
    confirmDNPAYPayment
}