// Express Router for Category API
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const {
  validateCategoryName,
  validateCategoryNameForUpdate
} = require('../middlewares/category.validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *           example: "671fe2a39b4d1c00234a5678"
 *         name:
 *           type: string
 *           description: Unique category name (at least 3 characters)
 *           example: "Home & Living"
 *         slug:
 *           type: string
 *           description: Auto-generated lowercase slug
 *           example: "home-living"
 *         description:
 *           type: string
 *           description: Category description
 *           example: "Furniture and decoration items"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Category name (minimum 3 characters)
 *           example: "Home & Living"
 *         description:
 *           type: string
 *           description: Optional description
 *           example: "Furniture and decoration items"
 *     CategoryUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Category name to update (minimum 3 characters if provided)
 *           example: "Kitchen & Dining"
 *         description:
 *           type: string
 *           description: New description
 *           example: "Cookware and dining table accessories"
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories with pagination and sorting
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error (name is empty or shorter than 3 characters)
 *       409:
 *         description: Conflict (name or slug already exists)
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category details by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Malformed ID (invalid ObjectId format)
 *       404:
 *         description: Category not found for valid ID
 *
 *   patch:
 *     summary: Partially update category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateInput'
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Malformed ID or invalid name length
 *       404:
 *         description: Category not found to update
 *       409:
 *         description: Conflict (updated name or slug already exists)
 *
 *   put:
 *     summary: Update category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Malformed ID or validation error
 *       404:
 *         description: Category not found to update
 *       409:
 *         description: Conflict (name or slug already exists)
 *
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Malformed ID (invalid ObjectId format)
 *       404:
 *         description: Category not found to delete
 */

router.route('/')
  .get(categoryController.getAllCategories)
  .post(validateCategoryName, categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .patch(validateCategoryNameForUpdate, categoryController.updateCategory)
  .put(validateCategoryNameForUpdate, categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
