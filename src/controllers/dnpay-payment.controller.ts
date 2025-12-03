import type { Context } from "hono";
import { dnpayPaymentService } from "@/services/dnpay-payment.service";
import { successResponse } from "@/utils/response";

const getPaymentIntentById = async (c: Context) => {
    const paymentId = c.req.param('id');
    const result = await dnpayPaymentService.getPaymentIntentById(paymentId);
    return successResponse({
        c,
        message: 'DNPAY payment intent retrieved successfully',
        data: result
    });
};

const confirmDNPAYPayment = async (c: Context) => {
    const paymentId = c.req.param('id');
    const payload = await c.req.json();
    const user = c.get('user');
    const result = await dnpayPaymentService.confirmDNPAYPayment(paymentId, payload, user);
    return successResponse({
        c,
        message: 'DNPAY payment confirmed successfully',
        data: result
    });
}

export const dnpayPaymentController = {
    getPaymentIntentById,
    confirmDNPAYPayment
}