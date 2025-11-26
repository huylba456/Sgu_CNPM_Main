import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { products } = useData();
  const isGuest = !user;
  const product = useMemo(() => products.find((item) => item.id === id), [id, products]);

  if (!product) {
    return (
      <div className="page">
        <h2>Không tìm thấy sản phẩm</h2>
      </div>
    );
  }

  return (
    <div className="page detail">
      <img src={product.image} alt={product.name} className="detail-image" />
      <div className="detail-content">
        <h2>{product.name}</h2>
        <p className="muted">{product.restaurant}</p>
        <p>{product.description}</p>
        <ul>
          <li>Phân loại: {product.category}</li>
          <li>Đánh giá: {product.rating}/5</li>
          <li>Thời gian drone giao dự kiến: {product.deliveryTime} phút</li>
        </ul>
        <div className="actions">
          <span className="price">{product.price.toLocaleString()} đ</span>
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={isGuest}
            title={isGuest ? 'Đăng nhập để đặt món' : undefined}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
