// src/App.jsx
import { useState } from 'react';
import ProductsPage from './pages/Ex1';
import ShopPage from './pages/Ex2';
import ProductPage from './pages/Ex3';
import BlogManagerPage from './pages/BlogManagerPage';
import './App.css';

function App() {
  // Quản lý tab/giao diện đang chọn: 'shop', 'products', 'BlogManager' hoặc 'product'
  const [activeTab, setActiveTab] = useState('products');

  // Hàm quyết định giao diện nào sẽ được hiển thị
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'shop':
        return <ShopPage />;
      case 'products':
        return <ProductsPage />;
      case 'product':
        return <ProductPage />;
      case 'BlogManager':
        return <BlogManagerPage />;
      default:
        return <ProductsPage />;
    }
  };

  return (
    <div className="app-container">
      {/* HEADER ĐIỀU HƯỚNG */}
      <header className="navbar">
        <div className="navbar-logo">MyStore</div>
        <nav className="navbar-links">
          <button 
            className={`nav-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            Shop
          </button>
          <button 
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`nav-btn ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            Dummy Products
          </button>
          <button 
            className={`nav-btn ${activeTab === 'BlogManager' ? 'active' : ''}`}
            onClick={() => setActiveTab('BlogManager')}
          >
            Posts
          </button>
        </nav>
      </header>

      {/* VÙNG HIỂN THỊ NỘI DUNG TƯƠNG ỨNG */}
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;