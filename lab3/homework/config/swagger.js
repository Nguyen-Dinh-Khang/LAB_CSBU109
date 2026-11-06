const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Chuẩn hóa đường dẫn tương thích Windows
const routesPath = path.resolve(__dirname, '../route/*.js').split(path.sep).join('/');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce Orders API - Lab 3 Homework',
            version: '1.0.0',
            description: 'API documentation for E-commerce Orders System with MySQL transactions, routing, and Swagger UI'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Local Development Server (API v1)'
            }
        ],
        tags: [
            {
                name: 'Orders',
                description: 'Endpoints for managing orders, transactions, and sales analytics'
            },
            {
                name: 'Customers',
                description: 'Endpoints for customer order history'
            }
        ]
    },
    apis: [routesPath]
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(' Swagger UI documentation available at: http://localhost:5000/api-docs');
};

module.exports = setupSwagger;
