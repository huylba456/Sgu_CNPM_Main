import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/mockProducts.js';

const ProductsPage = () => (
  <div className="page catalog-page">
    <header className="catalog-header">
      <div className="catalog-heading">
        <h2>Danh mục món ăn</h2>
        <p className="muted">Danh sách món ăn nổi bật đang được phục vụ.</p>
      </div>
      <p className="muted">Các bộ lọc, tìm kiếm và sắp xếp sẽ được triển khai trong giai đoạn 2.</p>
    </header>
    <section className="grid">
      {products.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </section>
  </div>
);

export default ProductsPage;
