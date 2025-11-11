import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';

const AdminLayout = () => {
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
        <h2>FoodFast Admin</h2>
        <nav>
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products">Sản phẩm</NavLink>
          <NavLink to="/admin/drones">Drones</NavLink>
          <NavLink to="/admin/users">Người dùng</NavLink>
          <NavLink to="/admin/orders">Đơn hàng</NavLink>
        </nav>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-toolbar">
          <span className="muted">{user?.name}</span>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
        <Outlet />
      </section>
    </div>
  );
};

export default AdminLayout;
