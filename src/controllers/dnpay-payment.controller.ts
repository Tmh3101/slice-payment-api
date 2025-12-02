import type { Context } from "hono";
import { dnpayPaymentService } from "@/services/dnpay-payment.service";
import { successResponse } from "@/utils/response";

const confirmDNPAYPayment = async (c: Context) => {
    const paymentId = c.req.param('id');
    await dnpayPaymentService.confirmDNPAYPayment(paymentId);
    return successResponse({
        c,
        message: 'DNPAY payment confirmed successfully',
        data: {}
    });
}

export const dnpayPaymentController = {
    confirmDNPAYPayment
}