// Controllers for Category API
const mongoose = require('mongoose');
const Category = require('../models/category.model');
const { generateSlug } = require('../models/category.model');

// 1. GET /api/categories - Lấy danh sách có phân trang và sắp xếp (Requirement 7)
exports.getAllCategories = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const skip = (page - 1) * limit;

    const totalCategories = await Category.countDocuments();
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit) || 1,
        totalCategories
      },
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/categories/:id - Lấy chi tiết category theo ID (Requirement 1 & 5)
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Requirement 5: Kiểm tra ID sai định dạng (malformed ID) -> 400 Bad Request
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }

    const category = await Category.findById(id);

    // Requirement 5: ID hợp lệ nhưng không tồn tại -> 404 Not Found
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found with the given ID'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/categories - Tạo category mới (Requirement 1, 3, 4)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const newCategory = new Category({
      name,
      description
    });

    // Mongoose pre('save') hook sẽ tự động sinh slug từ name
    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: savedCategory
    });
  } catch (error) {
    // Requirement 4: Bắt lỗi trùng unique key (code 11000) -> 409 Conflict
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'name';
      return res.status(409).json({
        success: false,
        message: `A category with this ${field} '${error.keyValue[field]}' already exists`
      });
    }
    next(error);
  }
};

// 4. PATCH & PUT /api/categories/:id - Cập nhật category (Requirement 1, 3, 5, 6)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Requirement 5: ID sai định dạng -> 400 Bad Request
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }

    const updates = { ...req.body };

    // Requirement 3: Vì pre('save') không chạy trên findByIdAndUpdate,
    // tự động tái tạo slug khi name thay đổi
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }

    // Requirement 6: Partial update với runValidators: true
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    // Requirement 5: ID hợp lệ nhưng không tìm thấy -> 404 Not Found
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found to update'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    // Requirement 4: Trùng unique khi cập nhật -> 409 Conflict
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'name';
      return res.status(409).json({
        success: false,
        message: `A category with this ${field} '${error.keyValue[field]}' already exists`
      });
    }
    next(error);
  }
};

// 5. DELETE /api/categories/:id - Xóa category (Requirement 1, 5)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Requirement 5: ID sai định dạng -> 400 Bad Request
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    // Requirement 5: ID hợp lệ nhưng không tìm thấy -> 404 Not Found
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found to delete'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory
    });
  } catch (error) {
    next(error);
  }
};
