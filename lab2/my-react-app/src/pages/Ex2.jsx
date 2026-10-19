import "./Ex2.css";
import { useState, useEffect } from "react";
import { products } from "../data/products";
import ProductCard2 from "../components/ProductCard2";

export default function ShopPage() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState("All");
  const [cart, setCart] = useState([]);

  // Danh mục lấy từ products
  const categories = ["All", ...new Set(products.map((item) => item.category))];

  // Lọc theo Category và Search text (không phân biệt hoa/thường)
  const displayProducts = products.filter((item) => {
    const matchCategory = selected === "All" || item.category === selected;
    const matchText = item.name.toLowerCase().includes(text.trim().toLowerCase());
    return matchCategory && matchText;
  });

  // Thêm vào giỏ hàng (nếu đã có thì tăng quantity, chưa có thì thêm mới)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Xoá sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Tính tổng số lượng & tổng tiền
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Cập nhật document.title theo số lượng sản phẩm trong giỏ
  useEffect(() => {
    document.title = `Shop (${totalCartCount} items)`;
  }, [totalCartCount]);

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <h1 className="page-title">Shop</h1>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="search-bar">
          <input
            placeholder="Search by name..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {categories.map((cate) => (
              <option key={cate} value={cate}>
                {cate}
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="product-grid">
          {displayProducts.map((item) => (
            <ProductCard2
              key={item.id}
              name={item.name}
              price={item.price}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </div>
      </div>

      {/* Bảng Giỏ hàng (Cart) bên phải */}
      <aside className="cart-sidebar">
        <h3 className="cart-title">Cart</h3>
        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-row">
                  <span className="cart-item-name">
                    {item.name} × {item.quantity}
                  </span>
                  <div className="cart-item-right">
                    <span className="cart-item-price">
                      {item.price * item.quantity} USD
                    </span>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <strong>Total: {totalPrice} USD</strong>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}