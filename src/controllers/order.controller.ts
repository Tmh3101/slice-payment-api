import type { Context } from "hono";
import { orderService } from "@/services/order.service";

const createOrder = async (c: Context) => {
    const orderData = await c.req.json();
    const newOrder = await orderService.createOrder(orderData);
    return c.json(newOrder, 201);
};

export const orderController = {
    createOrder,
}