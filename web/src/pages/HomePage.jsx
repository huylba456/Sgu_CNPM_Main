import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useData } from '../hooks/useData.js';

const HomePage = () => {
  const { products } = useData();
  const highlightedProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6),
    []
  );

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-badge">Đội drone tự động thế hệ mới</span>
          <h1>FoodFast Drone Delivery</h1>
          <p>
            Trải nghiệm giao đồ ăn trong 15 phút với đội drone tự động của FoodFast. Theo dõi hành
            trình thời gian thực và nhận món nóng hổi ngay khi drone hạ cánh.
          </p>
          <div className="hero-meta">
            <div className="hero-pill">
              <strong>15&apos;</strong>
              <span>Thời gian giao trung bình</span>
            </div>
            <div className="hero-pill">
              <strong>120+</strong>
              <span>Món ăn sẵn sàng phục vụ</span>
            </div>
            <div className="hero-pill">
              <strong>Realtime</strong>
              <span>Theo dõi hành trình giao hàng</span>
            </div>
          </div>
        </div>
        <div className="hero-controls">
          <div className="hero-actions">
            <Link className="ghost-button" to="/products">
              Khám phá thực đơn
            </Link>
            <Link className="ghost-button" to="/products">
              Đặt ngay
            </Link>
          </div>
        </div>
      </section>
      <section className="product-section">
        <header className="section-heading">
          <div>
            <h2>Nổi bật</h2>
            <p className="muted">Những món được đánh giá cao nhất bởi khách hàng FoodFast.</p>
          </div>
          <Link className="ghost-button" to="/products">
            Xem tất cả
          </Link>
        </header>
        <div className="grid">
          {highlightedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
