const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');


router.get('/:id/order-history', customerController.getOrderHistory);

module.exports = router;
