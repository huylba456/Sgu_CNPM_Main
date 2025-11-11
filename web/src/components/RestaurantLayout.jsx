import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';

const RestaurantLayout = () => {
  const { logout, user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <h2>FoodFast Nhà hàng</h2>
        <nav>
          <NavLink to="/restaurant" end>
            Tổng quan
          </NavLink>
          <NavLink to="/restaurant/products">Món ăn</NavLink>
          <NavLink to="/restaurant/orders">Đơn hàng</NavLink>
        </nav>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-toolbar">
          <span className="muted">{user?.restaurantName ?? user?.name}</span>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
        <Outlet />
      </section>
    </div>
  );
};

export default RestaurantLayout;
