// Main server entry point 
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express'); 
require('dotenv').config();
const mongoose = require('mongoose'); 
const productRoutes = require('./routes/product.routes'); 
const categoryRoutes = require('./routes/category.routes');

const app = express(); 
const PORT = process.env.PORT || process.env.DB_PORT || 3000; 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Swagger
const setupSwagger = require('./config/swagger'); 
setupSwagger(app); 

// Register API routes 
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes);

// Global error handler (must be registered AFTER the routes) 
app.use((err, req, res, next) => { 
  console.error('Server Error:', err.message); 
  
  let status = err.status || 500; 
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') status = 400; // schema validation failed 
  if (err.name === 'CastError') {
    status = 400;                                   // malformed ObjectId 
    message = `Invalid ID format for ${err.path}`;
  }
  if (err.code === 11000) {
    status = 409;                                   // duplicate unique key 
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A category with this ${field} '${err.keyValue[field]}' already exists`;
  }
  
  res.status(status).json({ 
    success: false, 
    message: message 
  }); 
}); 

mongoose.connect(`${process.env.MONGO_URI}`) 
  .then(() => { 
    app.listen(PORT, () => console.log('Server API is running at: http://localhost:' + PORT)); 
  }) 
  .catch((err) => console.error('MongoDB connection failed:', err.message));
