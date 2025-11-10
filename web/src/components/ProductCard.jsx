import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProductCard = ({ product }) => {
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
          <Link to={`/products/${product.id}`} className="ghost-button">
            Chi tiết
          </Link>
          {isGuest && <small className="muted">Đăng nhập để đặt món trong giai đoạn tiếp theo.</small>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
