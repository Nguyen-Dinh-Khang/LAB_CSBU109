const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL (mặc định của XAMPP: user 'root', không có mật khẩu)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'store_transaction_db'
};

async function processOrder(customerId, productId, quantity) {
  // 1. Tạo kết nối riêng biệt cho transaction
  const conn = await mysql.createConnection(dbConfig);

  try {
    // Mở transaction
    await conn.beginTransaction();
    console.log('--- Bắt đầu Transaction ---');

    // ==========================================
    // STEP 1: Kiểm tra số dư và tồn kho
    // ==========================================
    // Sử dụng FOR UPDATE để khóa hàng đọc, ngăn ngừa race condition
    const [custRows] = await conn.execute(
      'SELECT id, balance FROM customers WHERE id = ? FOR UPDATE',
      [customerId]
    );

    if (custRows.length === 0) {
      throw new Error(`Khách hàng ID ${customerId} không tồn tại.`);
    }

    const [prodRows] = await conn.execute(
      'SELECT id, price, stock FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );

    if (prodRows.length === 0) {
      throw new Error(`Sản phẩm ID ${productId} không tồn tại.`);
    }

    const customer = custRows[0];
    const product = prodRows[0];
    const totalAmount = Number(product.price) * quantity;

    console.log(`Kiểm tra: Khách có ${customer.balance}đ, Tổng đơn: ${totalAmount}đ. Tồn kho: ${product.stock}, Cần mua: ${quantity}`);

    // Kiểm tra điều kiện tồn kho
    if (product.stock < quantity) {
      throw new Error(`Không đủ hàng tồn kho (Còn lại: ${product.stock}, yêu cầu: ${quantity}).`);
    }

    // Kiểm tra điều kiện số dư
    if (Number(customer.balance) < totalAmount) {
      throw new Error(`Số dư không đủ (Hiện có: ${customer.balance}, yêu cầu: ${totalAmount}).`);
    }

    // ==========================================
    // STEP 2: Trừ tiền khách hàng
    // ==========================================
    await conn.execute(
      'UPDATE customers SET balance = balance - ? WHERE id = ?',
      [totalAmount, customerId]
    );
    console.log(`[Step 2] Đã trừ ${totalAmount}đ từ tài khoản khách hàng.`);

    // ==========================================
    // STEP 3: Trừ tồn kho sản phẩm
    // ==========================================
    await conn.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, productId]
    );
    console.log(`[Step 3] Đã trừ ${quantity} sản phẩm khỏi kho.`);

    // ==========================================
    // STEP 4: Tạo đơn hàng mới trong bảng orders
    // ==========================================
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (customer_id, total_amount, created_at) VALUES (?, ?, NOW())',
      [customerId, totalAmount]
    );
    const orderId = orderResult.insertId;
    console.log(`[Step 4] Tạo đơn hàng thành công (Order ID: ${orderId}).`);

    // ==========================================
    // STEP 5: Thêm chi tiết đơn hàng vào order_items
    // ==========================================
    await conn.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, quantity, product.price]
    );
    console.log(`[Step 5] Đã thêm mặt hàng vào order_items.`);

    // Tất cả các bước thành công -> COMMIT
    await conn.commit();
    console.log(' Transaction hoàn tất và COMMIT thành công!\n');

  } catch (error) {
    // Có lỗi xảy ra -> ROLLBACK để phục hồi trạng thái cũ
    await conn.rollback();
    console.error(` Đã xảy ra lỗi: ${error.message}`);
    console.log(' Đã gọi ROLLBACK, dữ liệu được giữ nguyên an toàn.\n');
  } finally {
    // Luôn đóng kết nối
    await conn.end();
  }
}

// Chạy thử nghiệm các trường hợp
async function runTests() {
  console.log('=== TEST: Đặt hàng thành công (Mua 2 chuột) ===');
  await processOrder(1, 1, 2);
}

runTests();