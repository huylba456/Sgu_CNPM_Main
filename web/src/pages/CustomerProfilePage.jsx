import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { initialOrders } from '../data/mockOrders.js';

const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};

const CustomerProfilePage = () => {
  const { user } = useAuth();

  const { customerOrders, totalPaid, deliveredCount } = useMemo(() => {
    if (!user) {
      return { customerOrders: [], totalPaid: 0, deliveredCount: 0 };
    }

    const orders = initialOrders.filter((order) => order.customerEmail === user.email);
    const total = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    const delivered = orders.filter((order) => order.status === 'delivered').length;

    return { customerOrders: orders, totalPaid: total, deliveredCount: delivered };
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Không tìm thấy thông tin khách hàng</h2>
          <p>Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
          <Link to="/login" className="primary-button">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Hồ sơ khách hàng</h2>
        <p className="muted">Quản lý thông tin cá nhân và lịch sử thanh toán của bạn.</p>
      </header>

      <section className="profile-summary">
        <div className="profile-card">
          <h3>Thông tin cá nhân</h3>
          <dl>
            <div>
              <dt>Họ và tên</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{user.phone || 'Chưa cập nhật'}</dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>{user.address || 'Chưa cập nhật'}</dd>
            </div>
          </dl>
        </div>

        <div className="profile-card highlights">
          <h3>Thanh toán</h3>
          <ul>
            <li>
              <span>Tổng tiền đã thanh toán</span>
              <strong>{totalPaid.toLocaleString('vi-VN')} đ</strong>
            </li>
            <li>
              <span>Đơn hàng đã giao</span>
              <strong>{deliveredCount}</strong>
            </li>
            <li>
              <span>Tổng số đơn hàng</span>
              <strong>{customerOrders.length}</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="profile-orders">
        <h3>Lịch sử đơn hàng</h3>
        {customerOrders.length === 0 ? (
          <p className="muted">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="order-history">
            {customerOrders.map((order) => (
              <article key={order.id} className="order-history-card">
                <header>
                  <h4>Đơn {order.id}</h4>
                  <span className={`status ${order.status}`}>{statusLabels[order.status] ?? order.status}</span>
                </header>
                <div className="order-history-meta">
                  <p>
                    <strong>Ngày đặt:</strong>{' '}
                    {new Date(order.placedAt).toLocaleString('vi-VN')}
                  </p>
                  <p>
                    <strong>Địa chỉ giao:</strong> {order.deliveryAddress ?? order.customerAddress}
                  </p>
                  <p>
                    <strong>Thanh toán:</strong> {order.paymentMethod ?? 'Đang cập nhật'}
                  </p>
                </div>
                <footer>
                  <p>
                    <strong>Tổng tiền:</strong> {order.total.toLocaleString('vi-VN')} đ
                  </p>
                  <Link to={`/orders/${order.id}`} className="outline-button">
                    Xem chi tiết
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerProfilePage;
