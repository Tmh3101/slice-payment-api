import { Hono } from "hono";
import { dnpayPaymentController } from "@/controllers/dnpay-payment.controller";
import { validate } from '@/utils/request-validator';
import { confirmDNPAYPaymentSchema } from "@/schema/dnpay-payment.schema";

const dnpayPaymentRoute = new Hono();

dnpayPaymentRoute.get(
    "/:id",
    dnpayPaymentController.getPaymentIntentById
);

dnpayPaymentRoute.post(
    "/:id/confirm",
    validate('json', confirmDNPAYPaymentSchema),
    dnpayPaymentController.confirmDNPAYPayment
);

export default dnpayPaymentRoute;