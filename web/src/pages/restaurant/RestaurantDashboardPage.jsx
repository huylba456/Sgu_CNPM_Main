import { useMemo } from 'react';
import StatsCard from '../../components/StatsCard.jsx';
import { restaurants } from '../../data/mockRestaurants.js';
import { initialOrders } from '../../data/mockOrders.js';
import { useAuth } from '../../hooks/useAuth.js';

const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};

const RestaurantDashboardPage = () => {
  const { user } = useAuth();
  const restaurant = restaurants.find((item) => item.id === user?.restaurantId) ?? restaurants[0];
  const orders = useMemo(
    () => initialOrders.filter((order) => order.restaurantId === restaurant.id),
    [restaurant.id]
  );

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const inProgress = orders.filter((order) => order.status === 'shipping' || order.status === 'preparing' || order.status === 'pending').length;

  return (
    <div className="page dashboard">
      <h2>{restaurant.name}</h2>
      <p className="muted">Drone pad: {restaurant.dronePad} • Liên hệ: {restaurant.contact}</p>
      <div className="stat-grid">
        <StatsCard title="Doanh thu tháng" value={`${revenue.toLocaleString()} đ`} />
        <StatsCard title="Đơn đang xử lý" value={inProgress} />
        <StatsCard title="Đánh giá trung bình" value="4.6/5" trend="98% khách hài lòng" />
      </div>
      <section className="panel">
        <h3>Đơn gần đây</h3>
        <div className="order-list compact">
          {orders.map((order) => (
            <div key={order.id} className="order-card compact">
              <h4>{order.id}</h4>
              <p>{order.customerName}</p>
              <span className={`status ${order.status}`}>{statusLabels[order.status]}</span>
              <span>{order.total.toLocaleString()} đ</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RestaurantDashboardPage;
