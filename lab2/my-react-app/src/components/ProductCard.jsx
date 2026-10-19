import "./ProductCard.css"; // Hoặc tên file CSS của bạn

export default function ProductCard({
  name,
  price = 0,
  inStock = true,
  image = "https://placehold.co/400x400/e9ecef/8f9ca8?text=No+image",
}) {
  return (
    <div className="card">
      {price < 20 && <span className="badge">Low price!</span>}
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{price.toLocaleString()} USD</p>
      {inStock ? (
        <span className="stock in">In stock</span>
      ) : (
        <span className="stock out">Sold out</span>
      )}
    </div>
  );
}