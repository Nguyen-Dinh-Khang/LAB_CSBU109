const express = require("express");
const router = express.Router();

const customerRoutes = require("./customer.routes");
const orderRoutes = require("./order.routes");


router.use("/api/v1/customers", customerRoutes);
router.use("/api/v1/orders", orderRoutes);


router.get('/', (req, res) => {
    res.json({ message: 'Welcome to E-commerce Orders API (Lab 3 Homework)' })
});

module.exports = router