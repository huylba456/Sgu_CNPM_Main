import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import StatsCard from '../components/StatsCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};

const OrdersPage = () => {
  const { orders, updateOrder } = useData();
  const [orderToCancel, setOrderToCancel] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

  const visibleOrders = useMemo(() => {
    if (!user) {
      return orders;
    }

    if (user.role === 'customer') {
      return orders.filter((order) => order.customerEmail === user.email);
    }

    if (user.role === 'restaurant') {
      return orders.filter((order) => order.restaurantId === user.restaurantId);
    }

    return orders;
  }, [orders, user]);

  const stats = useMemo(() => {
    const total = visibleOrders.length;
    const delivered = visibleOrders.filter((order) => order.status === 'delivered').length;
    const shipping = visibleOrders.filter((order) => order.status === 'shipping').length;
    return {
      total,
      delivered,
      shipping
    };
  }, [visibleOrders]);

  const openCancelModal = (id) => {
    const selected = orders.find((order) => order.id === id);
    if (selected) {
      setOrderToCancel(selected);
    }
  };

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    updateOrder(orderToCancel.id, { status: 'cancelled' });
    setOrderToCancel(null);
  };

  const handleDismissModal = () => {
    setOrderToCancel(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h2>Đơn hàng của tôi</h2>
        {location.state?.message && <div className="toast success">{location.state.message}</div>}
        <div className="stat-grid">
          <StatsCard title="Tổng đơn" value={stats.total} />
          <StatsCard title="Đã giao" value={stats.delivered} />
          <StatsCard title="Đang giao" value={stats.shipping} />
        </div>
      </header>
      <section className="order-list">
        {visibleOrders.length === 0 ? (
          <p className="muted">Bạn chưa có đơn hàng nào.</p>
        ) : (
          visibleOrders.map((order) => (
            <article key={order.id} className="order-card">
              <header>
                <h3>Đơn {order.code ?? order.id}</h3>
                <span className={`status ${order.status}`}>{statusLabels[order.status]}</span>
              </header>
              <div className="order-meta">
                <p>
                  <strong>Địa chỉ giao:</strong> {order.deliveryAddress ?? order.customerAddress}
                </p>
                <p>
                  <strong>Thanh toán:</strong> {order.paymentMethod ?? 'Đang cập nhật'}
                </p>
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} x {item.quantity}
                    <span>{(item.price * item.quantity).toLocaleString()} đ</span>
                  </li>
                ))}
              </ul>
              <footer>
                <div className="order-footer-meta">
                  <p>Tổng: {order.total.toLocaleString()} đ</p>
                  <p className="muted">Drone phụ trách: {order.droneId ?? 'Đang phân bổ'}</p>
                  <p className="muted">Thời gian đặt: {new Date(order.placedAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="order-footer-actions">
                  <Link to={`/orders/${order.id}`} className="outline-button">
                    Xem chi tiết
                  </Link>
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      className="cancel-order-button"
                      onClick={() => openCancelModal(order.id)}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </footer>
            </article>
          ))
        )}
      </section>
      {orderToCancel && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc chắn muốn hủy đơn {orderToCancel.code ?? orderToCancel.id} không?</p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={handleDismissModal}>
                Không
              </button>
              <button type="button" className="danger" onClick={handleConfirmCancel}>
                Có, hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
