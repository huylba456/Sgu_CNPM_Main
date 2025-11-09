import { Link, NavLink, Outlet } from 'react-router-dom';

const Layout = () => {
  const navLinkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          FoodFast
        </Link>
        <nav>
          <NavLink to="/" end className={navLinkClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Sản phẩm
          </NavLink>
        </nav>
        <div className="header-actions">
          <span className="muted">Đăng nhập sẽ được bổ sung ở giai đoạn tiếp theo.</span>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
