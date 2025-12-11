import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RevenueChart from '../../components/RevenueChart.jsx';
import { useRestaurants } from '../../hooks/useRestaurants.js';
import { useData } from '../../hooks/useData.js';

const AdminRestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants } = useRestaurants();
  const { orders } = useData();
  const restaurant = restaurants.find((item) => item.id === id);

  const now = useMemo(() => new Date(), []);
  const parsePlacedDate = (order) => new Date(order.placedAt ?? order.createdAt ?? order.updatedAt ?? now);

  const relatedOrders = useMemo(
    () =>
      orders
        .filter((order) => order.restaurantId === id || order.restaurant === restaurant?.name)
        .sort((a, b) => new Date(b.placedAt ?? 0) - new Date(a.placedAt ?? 0)),
    [id, orders, restaurant?.name]
  );

  if (!restaurant) {
    return (
      <div className="page dashboard">
        <p>Không tìm thấy nhà hàng.</p>
        <button type="button" onClick={() => navigate(-1)} className="ghost-button">
          Quay lại
        </button>
      </div>
    );
  }

  const totalRevenue = relatedOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const monthlyHistory = useMemo(() => {
    const points = [];
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const value = relatedOrders
        .filter((order) => {
          const placedDate = parsePlacedDate(order);
          return placedDate >= start && placedDate < end;
        })
        .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

      points.push({
        label: `${start.getMonth() + 1}/${start.getFullYear().toString().slice(-2)}`,
        value
      });
    }
    return points;
  }, [now, relatedOrders]);

  return (
    <div className="page dashboard">
      <div className="page-header">
        <div>
          <p className="muted">Chi tiết nhà hàng</p>
          <h2>{restaurant.name}</h2>
          <p className="muted">{restaurant.address || 'Chưa có địa chỉ'}</p>
        </div>
        <Link to="/admin/restaurants" className="ghost-button">
          Quay lại danh sách
        </Link>
      </div>

      <div className="restaurant-detail-grid">
        <div className="panel">
          <h3>Thông tin liên hệ</h3>
          <div className="restaurant-info">
            <div>
              <span className="muted">Địa chỉ</span>
              <p>{restaurant.address || 'Chưa có địa chỉ'}</p>
            </div>
            <div>
              <span className="muted">Liên hệ</span>
              <p>{restaurant.contact || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <span className="muted">Bãi đáp drone</span>
              <p>{restaurant.dronePad || 'Chưa cập nhật'}</p>
            </div>
          </div>
          <div className="restaurant-meta">
            <div>
              <span className="muted">Tổng doanh thu</span>
              <strong>{totalRevenue.toLocaleString('vi-VN')} đ</strong>
            </div>
            <div>
              <span className="muted">Tổng đơn hàng</span>
              <strong>{relatedOrders.length}</strong>
            </div>
          </div>
        </div>
        <RevenueChart
          title="Doanh thu theo tháng"
          subtitle="6 tháng gần nhất"
          data={monthlyHistory}
        />
      </div>

      <section className="panel">
        <h3>Đơn hàng gần nhất</h3>
        <div className="order-list compact">
          {relatedOrders.slice(0, 6).map((order) => (
            <div key={order.id} className="order-card compact">
              <div>
                <h4>{order.code ?? order.id}</h4>
                <p className="muted">Khách hàng: {order.customerName ?? 'Ẩn danh'}</p>
                <p className={`status ${order.status}`}>{order.status}</p>
              </div>
              <div className="order-footer-meta">
                <span>{Number(order.total ?? 0).toLocaleString('vi-VN')} đ</span>
                <span className="muted">{parsePlacedDate(order).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminRestaurantDetailPage;
