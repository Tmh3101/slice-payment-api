import type { Context } from "hono";
import { orderService } from "@/services/order.service";
import { createdResponse } from "@/utils/response";

const createOrder = async (c: Context) => {
    const orderData = await c.req.json();
    const user = c.get('user');
    const newOrder = await orderService.createOrder(orderData, user);
    return createdResponse({
        c,
        message: 'Order created successfully',
        data: newOrder
    });
};

export const orderController = {
    createOrder,
}