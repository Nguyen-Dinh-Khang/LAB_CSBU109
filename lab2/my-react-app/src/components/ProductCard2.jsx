// src/components/ProductCard.jsx
export default function ProductCard2({ name, price, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="card-thumb">
        <span>No image</span>
      </div>
      <div className="card-body">
        <h4 className="product-name">{name}</h4>
        <div className="product-price">{price} USD</div>
        <span className="badge-stock">In stock</span>
        
        {/* Nút Add to cart nằm ở đây */}
        <button className="btn-add" onClick={onAddToCart}>
          Add to cart
        </button>
      </div>
    </div>
  );
}