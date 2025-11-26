import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { orders } = useData();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saveMessage, setSaveMessage] = useState('');

  const { customerOrders, totalPaid, deliveredCount } = useMemo(() => {
    if (!user) {
      return { customerOrders: [], totalPaid: 0, deliveredCount: 0 };
    }

    const customerOrders = orders.filter((order) => order.customerEmail === user.email);
    const total = customerOrders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    const delivered = customerOrders.filter((order) => order.status === 'delivered').length;

    return { customerOrders, totalPaid: total, deliveredCount: delivered };
  }, [orders, user]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? ''
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user) return;

    const trimmed = {
      name: form.name.trim() || user.name,
      phone: form.phone.trim(),
      address: form.address.trim()
    };

    updateUser(user.id, trimmed);
    setSaveMessage('Đã lưu thông tin của bạn.');
  };

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
        <p className="muted">Quản lý thông tin cá nhân và tổng quan thanh toán của bạn.</p>
      </header>

      <section className="profile-summary">
        <div className="profile-card">
          <h3>Thông tin cá nhân</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label className="form-field">
              Họ và tên
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="form-field">
              Email
              <input value={user.email} disabled />
            </label>
            <label className="form-field">
              Số điện thoại
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
            </label>
            <label className="form-field">
              Địa chỉ
              <input name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ giao hàng" />
            </label>
            {saveMessage ? <p className="muted small">{saveMessage}</p> : null}
            <div className="actions">
              <button type="submit" className="primary-button">
                Lưu thay đổi
              </button>
            </div>
          </form>
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
    </div>
  );
};
export default CustomerProfilePage;
