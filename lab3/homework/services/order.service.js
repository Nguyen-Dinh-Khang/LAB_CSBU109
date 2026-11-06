const pool = require('../config/db');

/**
 * Service xử lý đơn hàng
 */
class OrderService {
    /**
     * 1. Tạo đơn hàng mới với SQL Transaction & Khóa hàng FOR UPDATE
     */
    async createOrder({ customerId, items }) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // 1.1 Kiểm tra xem khách hàng có tồn tại không
            const [customers] = await conn.query(
                'SELECT id FROM customers WHERE id = ?',
                [customerId]
            );
            if (customers.length === 0) {
                const error = new Error(`Customer with ID ${customerId} not found`);
                error.status = 404;
                throw error;
            }

            // 1.2 Lấy danh sách ID sản phẩm và khóa dòng bằng FOR UPDATE
            const productIds = items.map(item => item.productId);
            // Ghi chú: mysql2 hỗ trợ IN (?) khi truyền vào một mảng lồng: [productIds]
            const [products] = await conn.query(
                'SELECT id, product_name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
                [productIds]
            );

            // Kiểm tra xem có sản phẩm nào không tồn tại trong DB không
            const foundProductMap = new Map();
            products.forEach(p => foundProductMap.set(p.id, p));

            for (const item of items) {
                if (!foundProductMap.has(item.productId)) {
                    const error = new Error(`Product with ID ${item.productId} not found`);
                    error.status = 404;
                    throw error;
                }
            }

            // 1.3 Kiểm tra tồn kho và tính tổng tiền
            let totalAmount = 0;
            const itemsToInsert = [];

            for (const item of items) {
                const product = foundProductMap.get(item.productId);

                if (product.stock < item.quantity) {
                    const error = new Error(`Product '${product.product_name}' is out of stock (Available: ${product.stock}, Requested: ${item.quantity})`);
                    error.status = 400;
                    throw error;
                }

                const unitPrice = parseFloat(product.price);
                totalAmount += unitPrice * item.quantity;

                itemsToInsert.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: unitPrice
                });
            }

            // 1.4 Tạo bản ghi orders
            const [orderResult] = await conn.query(
                'INSERT INTO orders (customer_id, status, total_amount) VALUES (?, ?, ?)',
                [customerId, 'pending', totalAmount]
            );
            const orderId = orderResult.insertId;

            // 1.5 Thêm chi tiết order_items và trừ tồn kho sản phẩm
            for (const item of itemsToInsert) {
                await conn.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [orderId, item.productId, item.quantity, item.unitPrice]
                );

                await conn.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.productId]
                );
            }

            // Hoàn tất transaction thành công
            await conn.commit();

            return {
                id: orderId,
                customerId,
                status: 'pending',
                totalAmount,
                items: itemsToInsert
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * 2. Lấy danh sách đơn hàng có phân trang, lọc và JOIN
     */
    async getAllOrders({ status, customerId, page = 1, limit = 5 }) {
        const offset = (page - 1) * limit;
        const whereClauses = [];
        const params = [];

        if (status) {
            whereClauses.push('o.status = ?');
            params.push(status);
        }

        if (customerId) {
            whereClauses.push('o.customer_id = ?');
            params.push(Number(customerId));
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Query đếm tổng số bản ghi
        const countSql = `
            SELECT COUNT(DISTINCT o.id) AS total
            FROM orders o
            ${whereSql}
        `;
        const [countResult] = await pool.query(countSql, params);
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit) || 1;

        // Query lấy dữ liệu với JOIN customers và aggregate order_items
        const dataSql = `
            SELECT 
                o.id AS order_id,
                c.full_name AS customer_name,
                c.email,
                o.status,
                o.total_amount,
                COALESCE(SUM(oi.quantity), 0) AS total_items_count,
                o.created_at
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereSql}
            GROUP BY o.id, c.full_name, c.email, o.status, o.total_amount, o.created_at
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [orders] = await pool.query(dataSql, [...params, Number(limit), Number(offset)]);

        return {
            page: Number(page),
            limit: Number(limit),
            totalRecords,
            totalPages,
            data: orders
        };
    }

    /**
     * 3. Lấy chi tiết đơn hàng dạng lồng (Nested JSON)
     */
    async getOrderById(orderId) {
        // Lấy thông tin order và customer
        const [orderRows] = await pool.query(`
            SELECT 
                o.id,
                o.status,
                o.total_amount,
                o.created_at,
                c.id AS customer_id,
                c.full_name,
                c.email,
                c.phone
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `, [orderId]);

        if (orderRows.length === 0) {
            const error = new Error(`Order with ID ${orderId} not found`);
            error.status = 404;
            throw error;
        }

        const orderInfo = orderRows[0];

        // Lấy danh sách sản phẩm trong đơn
        const [items] = await pool.query(`
            SELECT 
                oi.product_id,
                p.product_name,
                oi.quantity,
                oi.unit_price,
                (oi.quantity * oi.unit_price) AS subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);

        return {
            id: orderInfo.id,
            status: orderInfo.status,
            totalAmount: orderInfo.total_amount,
            createdAt: orderInfo.created_at,
            customer: {
                id: orderInfo.customer_id,
                fullName: orderInfo.full_name,
                email: orderInfo.email,
                phone: orderInfo.phone
            },
            items
        };
    }

    /**
     * 4. Cập nhật trạng thái đơn hàng & hoàn trả lại tồn kho nếu hủy
     */
    async updateOrderStatus(orderId, newStatus) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [orders] = await conn.query(
                'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
                [orderId]
            );

            if (orders.length === 0) {
                const error = new Error(`Order with ID ${orderId} not found`);
                error.status = 404;
                throw error;
            }

            const currentOrder = orders[0];

            // Nếu đơn đã là 'cancelled' thì không cho phép đổi lại
            if (currentOrder.status === 'cancelled') {
                const error = new Error("Order is already cancelled and cannot change status again");
                error.status = 400;
                throw error;
            }

            // Nếu đổi từ pending/completed sang cancelled -> hoàn trả tồn kho
            if (newStatus === 'cancelled' && (currentOrder.status === 'pending' || currentOrder.status === 'completed')) {
                const [items] = await conn.query(
                    'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                    [orderId]
                );

                for (const item of items) {
                    await conn.query(
                        'UPDATE products SET stock = stock + ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }

            // Cập nhật trạng thái
            await conn.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                [newStatus, orderId]
            );

            await conn.commit();

            return {
                id: orderId,
                previousStatus: currentOrder.status,
                newStatus
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * 5. Xóa đơn hàng (Hoàn lại kho nếu chưa hủy, order_items tự xóa do CASCADE)
     */
    async deleteOrder(orderId) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [orders] = await conn.query(
                'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
                [orderId]
            );

            if (orders.length === 0) {
                const error = new Error(`Order with ID ${orderId} not found`);
                error.status = 404;
                throw error;
            }

            const currentOrder = orders[0];

            // Nếu đơn chưa bị hủy, cần hoàn trả lại số lượng tồn kho trước khi xóa
            if (currentOrder.status !== 'cancelled') {
                const [items] = await conn.query(
                    'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                    [orderId]
                );

                for (const item of items) {
                    await conn.query(
                        'UPDATE products SET stock = stock + ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }

            // Xóa đơn (order_items sẽ tự động bị xóa theo ON DELETE CASCADE)
            await conn.query('DELETE FROM orders WHERE id = ?', [orderId]);

            await conn.commit();
            return { message: `Order #${orderId} deleted successfully` };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * 6. Thống kê doanh thu (Sales Summary)
     */
    async getSalesSummary() {
        // Thống kê doanh thu các đơn hàng 'completed'
        const [stats] = await pool.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COUNT(id) AS completedOrdersCount,
                COALESCE(AVG(total_amount), 0) AS averageOrderValue
            FROM orders
            WHERE status = 'completed'
        `);

        // Top 3 sản phẩm bán chạy nhất trong các đơn 'completed'
        const [topProducts] = await pool.query(`
            SELECT 
                p.id AS productId,
                p.product_name AS productName,
                SUM(oi.quantity) AS totalQuantitySold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status = 'completed'
            GROUP BY p.id, p.product_name
            ORDER BY totalQuantitySold DESC
            LIMIT 3
        `);

        return {
            totalRevenue: parseFloat(stats[0].totalRevenue),
            completedOrdersCount: Number(stats[0].completedOrdersCount),
            averageOrderValue: parseFloat(stats[0].averageOrderValue),
            topSellingProducts: topProducts
        };
    }
}

module.exports = new OrderService();
