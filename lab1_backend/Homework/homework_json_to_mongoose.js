const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ==========================================
// 1. ITEM SCHEMA (Sub-document)
// ==========================================
const itemSchema = new Schema({
  productName: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc']
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng tối thiểu là 1']
  },
  price: {
    type: Number,
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá không được âm']
  }
}, { _id: false });

// ==========================================
// 2. INVOICE SCHEMA & VALIDATIONS
// ==========================================
const invoiceSchema = new Schema({
  invoiceCode: {
    type: String,
    required: [true, 'Mã hóa đơn là bắt buộc'],
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Tên khách hàng là bắt buộc'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Email khách hàng là bắt buộc'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Định dạng email không hợp lệ']
  },
  items: {
    type: [itemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return Array.isArray(items) && items.length > 0;
      },
      message: 'Hóa đơn phải chứa ít nhất 1 mặt hàng (items không được rỗng)'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Phương thức thanh toán là bắt buộc'],
    enum: {
      values: ['CreditCard', 'Momo', 'Cash', 'BankTransfer'],
      message: '{VALUE} không hợp lệ (Chỉ chấp nhận: CreditCard, Momo, Cash, BankTransfer)'
    }
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware tính tổng tiền (Mongoose v8+: không dùng tham số next)
invoiceSchema.pre('validate', function() {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// ==========================================
// 3. ĐỌC FILE JSON, VALIDATE & SYNC VÀO MONGODB
// ==========================================
async function syncInvoices() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error(' Lỗi: Chưa cấu hình MONGO_URI trong file .env');
    return;
  }

  const filePath = path.join(__dirname, 'invoices.json');

  try {
    // 1. Đọc và parse file JSON
    if (!fs.existsSync(filePath)) {
      throw new Error(`File không tồn tại tại: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const invoicesData = JSON.parse(fileContent);

    if (!Array.isArray(invoicesData)) {
      throw new Error('Dữ liệu invoices.json phải là một mảng (Array)');
    }

    console.log(` Đã đọc thành công ${invoicesData.length} hóa đơn từ file.`);

    // 2. Kết nối MongoDB Atlas
    await mongoose.connect(MONGO_URI);
    console.log(' Đã kết nối MongoDB thành công.');

    // Dọn dẹp collection cũ
    await Invoice.deleteMany({});
    console.log(' Đã dọn dẹp collection invoices cũ.');

    // 3. Validate từng document bằng doc.validate() chuẩn bất đồng bộ
    const validInvoices = [];
    for (const rawInvoice of invoicesData) {
      try {
        const doc = new Invoice(rawInvoice);
        await doc.validate(); // Dùng validate() thay vì validateSync()
        validInvoices.push(doc);
      } catch (valErr) {
        console.warn(` Hóa đơn ${rawInvoice.invoiceCode || 'Không mã'} bị từ chối:`, valErr.message);
      }
    }

    // 4. Đồng bộ vào MongoDB Atlas
    if (validInvoices.length > 0) {
      const insertedDocs = await Invoice.insertMany(validInvoices);
      console.log(`\n Đồng bộ thành công ${insertedDocs.length} hóa đơn vào collection invoices!\n`);

      insertedDocs.forEach((inv) => {
        console.log(`- Mã: ${inv.invoiceCode} | Khách: ${inv.customerName} | TT: ${inv.paymentMethod} | Tổng tiền: ${inv.totalAmount.toLocaleString('vi-VN')} VND`);
      });
    } else {
      console.log(' Không có hóa đơn nào hợp lệ.');
    }

  } catch (err) {
    console.error(' Gặp lỗi trong quá trình thực thi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n Đã đóng kết nối cơ sở dữ liệu.');
  }
}

syncInvoices();