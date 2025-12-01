import type { Context } from "hono";
import { dnpayPaymentService } from "@/services/dnpay-payment.service";
import { successResponse } from "@/utils/response";

const handleDNPAYPaymentWebhook = async (c: Context) => {
    const payload = await c.req.json();
    await dnpayPaymentService.handleDNPAYPaymentWebhook(payload);
    return successResponse({
        c,
        message: 'DNPAY webhook handled successfully',
        data: {}
    });
}

export const dnpayPaymentController = {
    handleDNPAYPaymentWebhook,
}