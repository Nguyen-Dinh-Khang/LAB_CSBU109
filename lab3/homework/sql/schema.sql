CREATE DATABASE IF NOT EXISTS ecommerce_order_db;
USE ecommerce_order_db;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_items_order 
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_items_product 
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT
);

-- ================= INSERT DỮ LIỆU MẪU =================

INSERT INTO customers (full_name, email, phone) VALUES 
('Nguyen Van A', 'nguyenvana@gmail.com', '0901234567'),
('Tran Thi B', 'tranthib@gmail.com', '0912345678'),
('Le Van C', 'levanc@gmail.com', '0987654321'),
('Pham Thi D', 'phamthid@gmail.com', '0933445566');

INSERT INTO products (product_name, price, stock) VALUES
('Laptop Dell XPS 15', 35000000.00, 10),
('Mechanical Keyboard Keychron K2', 1850000.00, 25),
('Wireless Mouse Logitech MX Master 3S', 2490000.00, 15),
('Monitor Dell Ultrasharp 27 inch', 11500000.00, 8),
('USB-C Hub Ugreen 6-in-1', 550000.00, 30);

INSERT INTO orders (id, customer_id, status, total_amount, created_at) VALUES
(1, 1, 'completed', 39340000.00, '2026-11-01 10:00:00'),
(2, 2, 'pending', 2490000.00, '2026-11-03 14:30:00'),
(3, 1, 'completed', 1850000.00, '2026-11-04 09:15:00'),
(4, 3, 'cancelled', 11500000.00, '2026-11-05 16:00:00');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 35000000.00),
(1, 2, 1, 1850000.00),
(1, 3, 1, 2490000.00),
(2, 3, 1, 2490000.00),
(3, 2, 1, 1850000.00),
(4, 4, 1, 11500000.00);
