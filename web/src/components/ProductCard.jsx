import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isGuest = !user;

  return (
    <div className="card">
      <Link to={`/products/${product.id}`} className="card-image-link">
        <img src={product.image} alt={product.name} className="card-image" />
      </Link>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.restaurant}</p>
        <p className="description">{product.description}</p>
        <div className="card-footer">
          <span className="price">{product.price.toLocaleString()} đ</span>
          <div className="actions">
            <Link to={`/products/${product.id}`} className="ghost-button">
              Chi tiết
            </Link>
            <button
              type="button"
              className="primary-button"
              onClick={() => addToCart(product)}
              disabled={isGuest}
              title={isGuest ? 'Đăng nhập để đặt món' : undefined}
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
