import { useMemo } from 'react';
import StatsCard from '../../components/StatsCard.jsx';
import { useRestaurants } from '../../hooks/useRestaurants.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useData } from '../../hooks/useData.js';

const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};

const RestaurantDashboardPage = () => {
  const { user } = useAuth();
  const { restaurants } = useRestaurants();
  const { orders: allOrders } = useData();
  const restaurant =
    restaurants.find((item) => item.id === user?.restaurantId) ||
    restaurants.find((item) => item.name === user?.restaurantName);
  const orders = useMemo(
    () => (restaurant ? allOrders.filter((order) => order.restaurantId === restaurant.id) : []),
    [allOrders, restaurant?.id]
  );

  const now = useMemo(() => new Date(), []);
  const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const startOfNextMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 1), [now]);
  const last30DaysCutoff = useMemo(() => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), [now]);

  const parsePlacedDate = (order) => new Date(order.placedAt ?? order.createdAt ?? order.updatedAt ?? now);

  const revenue = useMemo(
    () =>
      orders
        .filter((order) => {
          const placedDate = parsePlacedDate(order);
          return placedDate >= startOfMonth && placedDate < startOfNextMonth;
        })
        .reduce((sum, order) => sum + order.total, 0),
    [orders, startOfMonth, startOfNextMonth]
  );

  const inProgress = orders.filter(
    (order) => order.status === 'shipping' || order.status === 'preparing' || order.status === 'pending'
  ).length;

  const newCustomers = useMemo(() => {
    const uniqueCustomers = new Set();
    orders.forEach((order) => {
      const placedDate = parsePlacedDate(order);
      if (placedDate >= last30DaysCutoff) {
        uniqueCustomers.add(order.customerEmail ?? order.customerName);
      }
    });
    return uniqueCustomers.size;
  }, [last30DaysCutoff, orders]);

  return (
    <div className="page dashboard">
      {!restaurant ? (
        <div className="alert warning">Tài khoản chưa được gán nhà hàng. Vui lòng liên hệ quản trị.</div>
      ) : null}
      <h2>{restaurant?.name ?? 'Chưa gán nhà hàng'}</h2>
      {restaurant ? (
        <p className="muted">Drone pad: {restaurant.dronePad} • Liên hệ: {restaurant.contact}</p>
      ) : null}
      <div className="stat-grid">
        <StatsCard title="Doanh thu tháng" value={`${revenue.toLocaleString()} đ`} />
        <StatsCard title="Đơn đang xử lý" value={inProgress} />
        <StatsCard title="Khách hàng mới" value={`${newCustomers} (30 ngày)`} />
      </div>
      <section className="panel">
        <h3>Đơn gần đây</h3>
        <div className="order-list compact">
          {orders.map((order) => (
            <div key={order.id} className="order-card compact">
              <h4>{order.code ?? order.id}</h4>
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
