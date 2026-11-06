// Express Router configuration for Products
const express = require('express'); 
const router = express.Router(); 
const productController = require('../controllers/product.controller'); 

/** 
 * @swagger 
 * components: 
 *   schemas: 
 *     Product: 
 *       type: object 
 *       required: 
 *         - name 
 *         - category 
 *         - price 
 *       properties: 
 *         _id: 
 *           type: string 
 *           description: Auto-generated MongoDB ObjectId 
 *           example: "671fe2a39b4d1c00234a5678"
 *         name: 
 *           type: string 
 *           description: Product name
 *           example: "Sony WH-1000XM5" 
 *         category: 
 *           type: string 
 *           enum: [Electronics, Audio, Accessories] 
 *           description: Category category of the product
 *           example: "Audio" 
 *         price: 
 *           type: number 
 *           description: Price of the product (must be >= 0)
 *           example: 350
 *         stock: 
 *           type: integer 
 *           description: Available stock count
 *           example: 20
 *         description:
 *           type: string
 *           description: Additional description
 *           example: "Premium wireless noise-cancelling headphones"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: "Sony WH-1000XM5"
 *         category:
 *           type: string
 *           enum: [Electronics, Audio, Accessories]
 *           example: "Audio"
 *         price:
 *           type: number
 *           example: 350
 *         stock:
 *           type: integer
 *           example: 20
 *         description:
 *           type: string
 *           example: "Premium wireless noise-cancelling headphones"
 */ 

/** 
 * @swagger 
 * /products: 
 *   get: 
 *     summary: Get list of products with filters and pagination 
 *     tags: [Products] 
 *     parameters: 
 *       - in: query 
 *         name: category 
 *         schema: 
 *           type: string 
 *         description: Filter by category (Electronics, Audio, Accessories) 
 *       - in: query 
 *         name: minPrice 
 *         schema: 
 *           type: number 
 *         description: Minimum price filter 
 *       - in: query 
 *         name: maxPrice 
 *         schema: 
 *           type: number 
 *         description: Maximum price filter 
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
 *         description: Products retrieved successfully 
 *       500: 
 *         description: Internal server error 
 * 
 *   post: 
 *     summary: Create a new product 
 *     tags: [Products] 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             $ref: '#/components/schemas/ProductInput' 
 *     responses: 
 *       201: 
 *         description: Product created successfully 
 *         content: 
 *           application/json: 
 *             schema: 
 *               type: object 
 *               properties: 
 *                 success: 
 *                   type: boolean 
 *                   example: true 
 *                 message: 
 *                   type: string 
 *                   example: "Product created successfully" 
 *                 data: 
 *                   $ref: '#/components/schemas/Product' 
 *       400: 
 *         description: Bad request / Schema validation failed 
 */

/** 
 * @swagger 
 * /products/{id}: 
 *   get: 
 *     summary: Get a product by ID 
 *     tags: [Products] 
 *     parameters: 
 *       - $ref: '#/components/parameters/id' 
 *     responses: 
 *       200: 
 *         description: Product details retrieved successfully 
 *         content: 
 *           application/json: 
 *             schema: 
 *               type: object 
 *               properties: 
 *                 success: 
 *                   type: boolean 
 *                 data: 
 *                   $ref: '#/components/schemas/Product' 
 *       400: 
 *         description: Malformed or invalid ID format 
 *       404: 
 *         description: No product found with the given ID 
 * 
 *   put: 
 *     summary: Update an existing product by ID 
 *     tags: [Products] 
 *     parameters: 
 *       - $ref: '#/components/parameters/id' 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             $ref: '#/components/schemas/ProductInput' 
 *     responses: 
 *       200: 
 *         description: Product updated successfully 
 *         content: 
 *           application/json: 
 *             schema: 
 *               type: object 
 *               properties: 
 *                 success: 
 *                   type: boolean 
 *                 message: 
 *                   type: string 
 *                 data: 
 *                   $ref: '#/components/schemas/Product' 
 *       400: 
 *         description: Validation failed or malformed ID 
 *       404: 
 *         description: No product found to update 
 * 
 *   delete: 
 *     summary: Delete a product by ID 
 *     tags: [Products] 
 *     parameters: 
 *       - $ref: '#/components/parameters/id' 
 *     responses: 
 *       200: 
 *         description: Product deleted successfully 
 *       400: 
 *         description: Malformed or invalid ID format 
 *       404: 
 *         description: No product found to delete 
 */ 

router.route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router.route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router; 
