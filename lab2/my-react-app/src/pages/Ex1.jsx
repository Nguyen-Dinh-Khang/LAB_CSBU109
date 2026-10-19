import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const products = [
    { id: 1, name: "Keyboard", price: 25, inStock: true },
    { id: 2, name: "Mouse", price: 12, inStock: false },
    { id: 3, name: "Monitor", price: 180, inStock: true }
  ];

  return (
    <div className="page-content">
      <h1 className="page-title">Products</h1>
      <div className="product-list">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            name={item.name}
            price={item.price}
            inStock={item.inStock}
          />
        ))}
      </div>
    </div>
  );
}