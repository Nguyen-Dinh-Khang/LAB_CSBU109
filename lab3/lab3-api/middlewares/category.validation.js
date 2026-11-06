// Input-validation middleware for Category
// Requirement 2: if name is empty or shorter than 3 characters, immediately return 400 Bad Request

// Dùng cho POST /api/categories (bắt buộc có name)
const validateCategoryName = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category name cannot be empty'
    });
  }

  if (name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Category name must be at least 3 characters long'
    });
  }

  next();
};

// Dùng cho PATCH /api/categories/:id (nếu người dùng có gửi name để cập nhật)
const validateCategoryNameForUpdate = (req, res, next) => {
  if (req.body && req.body.name !== undefined) {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name cannot be empty'
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 3 characters long'
      });
    }
  }

  next();
};

module.exports = {
  validateCategoryName,
  validateCategoryNameForUpdate
};
