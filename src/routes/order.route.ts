import { Hono } from "hono";
import { validate } from '@/utils/request-validator';
import { orderController } from "@/controllers/order.controller";
import { orderSchema } from "@/schema/order.schema";

const orderRouter = new Hono();

orderRouter.post(
    "/",
    validate('json', orderSchema),
    orderController.createOrder
);

export default orderRouter;