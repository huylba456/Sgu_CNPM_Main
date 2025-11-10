import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleDecrease = (item) => {
    const nextQuantity = Math.max(1, item.quantity - 1);
    updateQuantity(item.id, nextQuantity);
  };

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleManualChange = (item, value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) {
      updateQuantity(item.id, 1);
      return;
    }
    updateQuantity(item.id, Math.floor(parsed));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h2>Giỏ hàng của bạn</h2>
        <p className="muted">Drone sẽ cất cánh ngay khi bạn hoàn tất thanh toán.</p>
      </header>
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <p>Giỏ hàng đang trống. Hãy khám phá các món ngon nhé!</p>
          <Link to="/products" className="secondary">
            Tiếp tục đặt món
          </Link>
        </div>
      ) : (
        <div className="cart">
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item__info">
                  <div className="cart-item__header">
                    <div>
                      <h4>{item.name}</h4>
                      <p className="muted">{item.restaurant}</p>
                    </div>
                    <div className="cart-item__pricing">
                      <span className="line-total">{(item.price * item.quantity).toLocaleString()} đ</span>
                      <span className="cart-item__unit muted">
                        {item.price.toLocaleString()} đ / món
                      </span>
                    </div>
                  </div>
                  <div className="cart-item__actions">
                    <div className="quantity">
                      <div className="quantity-control">
                        <span className="quantity-label">Số lượng</span>
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() => handleDecrease(item)}
                            aria-label="Giảm số lượng"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            aria-label={`Số lượng của ${item.name}`}
                            onChange={(event) => handleManualChange(item, event.target.value)}
                          />
                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() => handleIncrease(item)}
                            aria-label="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Xoá món
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <footer className="cart-summary">
            <h3>Tổng cộng</h3>
            <p className="total">{total.toLocaleString()} đ</p>
            <Link to="/checkout" className="primary checkout-button">
              Tiến hành thanh toán
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
};

export default CartPage;
