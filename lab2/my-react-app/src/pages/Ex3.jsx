import { useState, useEffect } from "react";
import { getProducts, getProductById } from "../services/productApi";
import "./Ex3.css";

const PAGE_SIZE = 12;

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho xem chi tiết
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 1. Tải danh sách sản phẩm khi đổi trang
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const skip = (page - 1) * PAGE_SIZE;

    getProducts(PAGE_SIZE, skip)
      .then((data) => {
        if (!isCancelled) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Đã xảy ra lỗi");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page]);

  // 3. Click xem chi tiết sản phẩm theo id
  const handleSelectProduct = (id) => {
    setDetailLoading(true);
    getProductById(id)
      .then((data) => {
        setSelectedProduct(data);
        setDetailLoading(false);
      })
      .catch((err) => {
        alert(err.message);
        setDetailLoading(false);
      });
  };

  // Tính số lượng trang tối đa
  const maxPage = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="title">Products (DummyJSON)</h2>

        {/* Trạng thái Loading hoặc Báo lỗi */}
        {loading && <div className="status-message">Loading...</div>}
        {error && <div className="status-message error">{error}</div>}

        {/* Danh sách 12 sản phẩm */}
        {!loading && !error && (
          <div className="product-grid">
            {products.map((item) => (
              <div
                key={item.id}
                className={`product-card ${selectedProduct?.id === item.id ? "active" : ""}`}
                onClick={() => handleSelectProduct(item.id)}
              >
                <div className="card-thumb">
                  <img src={item.thumbnail} alt={item.title} />
                </div>
                <div className="card-body">
                  <p className="product-name">{item.title}</p>
                  <p className="product-price">${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nút Previous / Next */}
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {page} / {maxPage}
          </span>
          <button
            className="btn-page"
            disabled={page >= maxPage || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* 3. Khung chi tiết sản phẩm bên phải */}
      <aside className="detail-sidebar">
        {detailLoading && <div className="status-message">Loading details...</div>}

        {!detailLoading && selectedProduct ? (
          <div className="detail-card">
            <button
              className="btn-close"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
            <div className="detail-img-box">
              <img
                src={selectedProduct.thumbnail}
                alt={selectedProduct.title}
              />
            </div>
            <h3 className="detail-name">{selectedProduct.title}</h3>
            <p className="detail-desc">{selectedProduct.description}</p>
            <div className="detail-meta">
              <p><strong>Price:</strong> ${selectedProduct.price}</p>
              <p><strong>Rating:</strong> {selectedProduct.rating} / 5</p>
              <p><strong>Stock:</strong> {selectedProduct.stock}</p>
            </div>
          </div>
        ) : (
          !detailLoading && (
            <div className="detail-placeholder">
              Click a product to see details
            </div>
          )
        )}
      </aside>
    </div>
  );
}