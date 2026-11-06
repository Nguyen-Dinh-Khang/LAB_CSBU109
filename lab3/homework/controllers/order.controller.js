const orderService = require('../services/order.service');

/**
 * Controller quản lý đơn hàng
 */
class OrderController {
    /**
     * POST /api/v1/orders - Tạo đơn hàng (SQL Transaction)
     */
    async createOrder(req, res, next) {
        try {
            const { customerId, items } = req.body;

            // Validate: customerId
            if (!customerId || isNaN(Number(customerId))) {
                return res.status(400).json({
                    success: false,
                    message: "customerId is required and must be a valid number"
                });
            }

            // Validate: items must be a non-empty array
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "items must be a non-empty array"
                });
            }

            // Validate: every item must have positive integer quantity and productId
            for (const item of items) {
                if (!item.productId || isNaN(Number(item.productId))) {
                    return res.status(400).json({
                        success: false,
                        message: "Each item must have a valid productId"
                    });
                }

                if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid quantity for productId ${item.productId}. Quantity must be a positive integer.`
                    });
                }
            }

            const newOrder = await orderService.createOrder({
                customerId: Number(customerId),
                items
            });

            return res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: newOrder
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders - Danh sách đơn hàng với bộ lọc, phân trang và JOIN
     */
    async getAllOrders(req, res, next) {
        try {
            const { status, customerId, page = 1, limit = 5 } = req.query;

            const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
            const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 5;

            const result = await orderService.getAllOrders({
                status,
                customerId,
                page: pageNum,
                limit: limitNum
            });

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/:id - Chi tiết đơn hàng dạng nested JSON
     */
    async getOrderById(req, res, next) {
        try {
            const orderId = req.params.id;
            const order = await orderService.getOrderById(orderId);

            return res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/orders/:id/status - Cập nhật trạng thái và hoàn tồn kho nếu hủy
     */
    async updateOrderStatus(req, res, next) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;

            const validStatuses = ['pending', 'completed', 'cancelled'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const result = await orderService.updateOrderStatus(orderId, status);

            return res.status(200).json({
                success: true,
                message: "Order status updated successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/orders/:id - Xóa đơn hàng và hoàn tồn kho
     */
    async deleteOrder(req, res, next) {
        try {
            const orderId = req.params.id;
            const result = await orderService.deleteOrder(orderId);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/analytics/sales-summary - Thống kê doanh thu
     */
    async getSalesSummary(req, res, next) {
        try {
            const summary = await orderService.getSalesSummary();

            return res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
