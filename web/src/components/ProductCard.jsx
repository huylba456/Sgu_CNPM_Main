import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {

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
          <small className="muted">Đặt món online sẽ được bổ sung sau.</small>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
