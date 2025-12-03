import type { Context } from "hono";
import { orderService } from "@/services/order.service";
import { createdResponse } from "@/utils/response";

const createOrder = async (c: Context) => {
    const orderData = await c.req.json();
    const user = c.get('user');
    const result = await orderService.createOrder(orderData, user);
    return createdResponse({
        c,
        message: 'Order created successfully',
        data: result
    });
};

const cancelOrder = async (c: Context) => {
    const orderId = c.req.param('orderId');
    const user = c.get('user');
    const result = await orderService.cancelOrder(orderId, user);
    return createdResponse({
        c,
        message: 'Order cancelled successfully',
        data: result
    });
};

export const orderController = {
    createOrder,
    cancelOrder
}