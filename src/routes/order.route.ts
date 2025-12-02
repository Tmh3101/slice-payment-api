import { Hono } from "hono";
import { validate } from '@/utils/request-validator';
import { orderController } from "@/controllers/order.controller";
import { orderSchema } from "@/schema/order.schema";
import { AppVariables } from "@/types";

const orderRouter = new Hono<{ Variables: AppVariables }>();

orderRouter.post(
    "/",
    validate('json', orderSchema),
    orderController.createOrder
);

export default orderRouter;