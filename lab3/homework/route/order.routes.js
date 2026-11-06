const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 2
 *     OrderCreateInput:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *       properties:
 *         customerId:
 *           type: integer
 *           example: 1
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemInput'
 *     StatusUpdateInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           example: "cancelled"
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order with SQL transaction and stock deduction
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateInput'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Out of stock or invalid payload
 *       404:
 *         description: Customer or product not found
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List orders with filtering, pagination and JOIN
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of orders with pagination metadata
 */
router.get('/', orderController.getAllOrders);

/**
 * @swagger
 * /orders/analytics/sales-summary:
 *   get:
 *     summary: Get sales revenue analytics for completed orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Sales statistics and top 3 selling products
 */
router.get('/analytics/sales-summary', orderController.getSalesSummary);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details with customer and items (nested JSON)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Detailed order info
 *       404:
 *         description: Order not found
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status & restore stock when cancelled
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdateInput'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status or order already cancelled
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', orderController.updateOrderStatus);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order and restore stock if not cancelled
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
