const pool = require('../config/db');

/**
 * Service xử lý thông tin khách hàng
 */
class CustomerService {
    /**
     * Lấy lịch sử đơn hàng của khách hàng cùng tổng chi tiêu trọn đời (chỉ tính đơn completed)
     */
    async getCustomerOrderHistory(customerId) {
        // 1. Kiểm tra khách hàng có tồn tại không
        const [customers] = await pool.query(
            'SELECT id, full_name, email, phone, created_at FROM customers WHERE id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            const error = new Error(`Customer with ID ${customerId} not found`);
            error.status = 404;
            throw error;
        }

        const customer = customers[0];

        // 2. Lấy toàn bộ đơn hàng của khách hàng
        const [orders] = await pool.query(`
            SELECT 
                o.id AS order_id,
                o.status,
                o.total_amount,
                o.created_at,
                COALESCE(SUM(oi.quantity), 0) AS total_items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ?
            GROUP BY o.id, o.status, o.total_amount, o.created_at
            ORDER BY o.created_at DESC
        `, [customerId]);

        // 3. Tính tổng tiền chi tiêu qua các đơn 'completed' (totalLifetimeSpent)
        const [spentResult] = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS totalLifetimeSpent
            FROM orders
            WHERE customer_id = ? AND status = 'completed'
        `, [customerId]);

        return {
            customer,
            totalLifetimeSpent: parseFloat(spentResult[0].totalLifetimeSpent),
            ordersCount: orders.length,
            orders
        };
    }
}

module.exports = new CustomerService();
