// Mongoose schema definition for Category
const mongoose = require('mongoose');

// Helper function to generate slug from name
// e.g. "Home & Living" -> "home-living"
function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                     // Tách dấu tiếng Việt nếu có
    .replace(/[\u0300-\u036f]/g, '')     // Loại bỏ dấu
    .replace(/&/g, '')                   // Loại bỏ ký tự &
    .replace(/[^a-z0-9\s-]/g, '')        // Loại bỏ ký tự đặc biệt
    .replace(/[\s-]+/g, '-')             // Thay khoảng trắng thành dấu -
    .replace(/^-+|-+$/g, '');            // Cắt dấu gạch ở đầu/cuối
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'Category name must be at least 3 characters long']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Mongoose pre('save') hook: Auto-generate slug before saving
categorySchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model('Category', categorySchema);
module.exports.generateSlug = generateSlug;
