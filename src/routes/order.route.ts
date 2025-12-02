import { Hono } from "hono";
import { validate } from '@/utils/request-validator';
import { orderController } from "@/controllers/order.controller";
import { orderSchema } from "@/schema/order.schema";
import { AppVariables } from "@/types";
import { authMiddleware } from '@/middlewares/auth.middleware';

const orderRouter = new Hono<{ Variables: AppVariables }>();

orderRouter.use(authMiddleware);

orderRouter.post(
    "/",
    validate('json', orderSchema),
    orderController.createOrder
);

export default orderRouter;