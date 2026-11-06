const customerService = require('../services/customer.service');

/**
 * Controller quản lý khách hàng
 */
class CustomerController {
    /**
     * GET /api/v1/customers/:id/order-history - Lấy lịch sử mua hàng và tổng chi tiêu
     */
    async getOrderHistory(req, res, next) {
        try {
            const customerId = req.params.id;

            if (!customerId || isNaN(Number(customerId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID. Must be a number."
                });
            }

            const history = await customerService.getCustomerOrderHistory(customerId);

            return res.status(200).json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CustomerController();
