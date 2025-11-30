import { Hono } from "hono";
import { orderController } from "@/controllers/order.controller";

const orderRouter = new Hono();

orderRouter.post("/", orderController.createOrder);

export default orderRouter;