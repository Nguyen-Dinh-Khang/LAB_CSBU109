const express = require("express");
require("dotenv").config();

require("./config/db");
const setupSwagger = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Docs
setupSwagger(app);

// API routes
app.use("/", require("./route/index"));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message || err);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(` Server is running at http://localhost:${PORT}`);
    console.log(` Swagger Docs: http://localhost:${PORT}/api-docs`);
});
