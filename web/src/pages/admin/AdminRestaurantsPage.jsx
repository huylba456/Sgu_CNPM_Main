import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useRestaurants } from '../../hooks/useRestaurants.js';
import { useData } from '../../hooks/useData.js';

const AdminRestaurantsPage = () => {
  const { restaurants } = useRestaurants();
  const { orders } = useData();

  const restaurantStats = useMemo(
    () =>
      restaurants.map((restaurant) => {
        const relatedOrders = orders.filter(
          (order) => order.restaurantId === restaurant.id || order.restaurant === restaurant.name
        );
        const revenue = relatedOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
        return {
          ...restaurant,
          revenue,
          orderCount: relatedOrders.length
        };
      }),
    [orders, restaurants]
  );

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h2>Nhà hàng</h2>
        <p className="muted">Theo dõi hiệu suất và doanh thu của từng nhà hàng.</p>
      </div>
      <div className="restaurant-grid">
        {restaurantStats.map((restaurant) => (
          <article key={restaurant.id} className="restaurant-card">
            <div className="restaurant-header">
              <img src={restaurant.image} alt={restaurant.name} className="restaurant-avatar" />
              <div>
                <h3>{restaurant.name}</h3>
                <p className="muted">{restaurant.address || 'Chưa có địa chỉ'}</p>
              </div>
            </div>
            <div className="restaurant-meta">
              <div>
                <span className="muted">Doanh thu</span>
                <strong>{restaurant.revenue.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div>
                <span className="muted">Đơn hàng</span>
                <strong>{restaurant.orderCount}</strong>
              </div>
            </div>
            <div className="restaurant-actions">
              <Link to={`/admin/restaurants/${restaurant.id}`} className="primary-button">
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminRestaurantsPage;
