import { Hono } from "hono";
import { dnpayPaymentController } from "@/controllers/dnpay-payment.controller";
// import { validate } from '@/utils/request-validator';
// import { orderSchema } from "@/schema/order.schema";

const dnpayPaymentRoute = new Hono();

dnpayPaymentRoute.get("/", (c) => c.text("Order API is working"));

dnpayPaymentRoute.post(
    "/webhook",
    // validate('json', orderSchema),
    dnpayPaymentController.handleDNPAYPaymentWebhook
);

export default dnpayPaymentRoute;