import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { useData } from '../hooks/useData.js';

const statusLabels = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Hủy'
};

const defaultPosition = { lat: 10.776889, lng: 106.700806 };

const coordinatesByAddress = {
  'Vinhomes Grand Park': { lat: 10.843018, lng: 106.828537 },
  'Landmark 81': { lat: 10.794167, lng: 106.722222 },
  'Thủ Thiêm Eco': { lat: 10.781135, lng: 106.730743 },
  'Sala Đại Quang Minh': { lat: 10.780379, lng: 106.716589 },
  'Thảo Điền, TP. Thủ Đức': { lat: 10.802101, lng: 106.737743 },
  'Quận 1, TP. HCM': { lat: 10.776889, lng: 106.700806 }
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const BoundsFitter = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [map, start, end]);

  return null;
};

const AnimatedDrone = ({ start, end, onArrive, isActive }) => {
  const [progress, setProgress] = useState(isActive ? 0 : 1);
  const animationRef = useRef(null);
  const duration = 30000; // 30s

  useEffect(() => {
    if (!isActive) {
      setProgress(1);
      return undefined;
    }

    setProgress(0);
    const startTime = performance.now();

    const step = (timestamp) => {
      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(elapsed / duration, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        onArrive();
        return;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, isActive, onArrive]);

  const position = useMemo(() => {
    if (!start || !end) {
      return start ?? defaultPosition;
    }

    return {
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress
    };
  }, [end, progress, start]);

  return <Marker position={position} />;
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder } = useData();
  const order = useMemo(() => orders.find((item) => item.id === id), [id, orders]);
  const { restaurants } = useRestaurants();
  const restaurant = useMemo(
    () => (order ? restaurants.find((item) => item.id === order.restaurantId) : undefined),
    [order, restaurants]
  );
  const [status, setStatus] = useState(order?.status ?? 'pending');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [droneArrived, setDroneArrived] = useState(order?.droneArrived || order?.status === 'delivered');

  useEffect(() => {
    setStatus(order?.status ?? 'pending');
    setDroneArrived(order?.droneArrived || order?.status === 'delivered');
  }, [order]);

  const restaurantPosition = order
    ? coordinatesByAddress[restaurant?.address] ?? defaultPosition
    : defaultPosition;
  const deliveryPosition = order
    ? order.deliveryCoordinates ??
      coordinatesByAddress[order.deliveryAddress ?? order.customerAddress] ??
      defaultPosition
    : defaultPosition;

  const handleCancelOrder = useCallback(() => {
    if (!order) return;
    updateOrder(order.id, { status: 'cancelled' });
    setStatus('cancelled');
    setShowCancelModal(false);
  }, [order, updateOrder]);

  const handleDroneArrive = useCallback(() => {
    if (!order) return;
    setDroneArrived(true);
    updateOrder(order.id, { droneArrived: true });
  }, [order, updateOrder]);

  const handleMarkDelivered = useCallback(() => {
    if (!order) return;
    updateOrder(order.id, { status: 'delivered' });
    setStatus('delivered');
    setDroneArrived(false);
  }, [order, updateOrder]);

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
          <Link to="/orders" className="primary-button">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="breadcrumb">
          <button type="button" className="ghost-button" onClick={() => navigate(-1)}>
            ← Trở lại
          </button>
          <span>Đơn hàng {order.code ?? order.id}</span>
        </div>
        <h2>Đơn hàng {order.code ?? order.id}</h2>
        <span className={`status ${status}`}>{statusLabels[status]}</span>
      </header>

      <section className="order-detail-grid">
        <article className="order-detail-card">
          <h3>Thông tin giao hàng</h3>
          <dl>
            <div>
              <dt>Khách hàng</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div>
              <dt>Địa chỉ giao</dt>
              <dd>{order.deliveryAddress ?? order.customerAddress}</dd>
            </div>
            <div>
              <dt>Thanh toán</dt>
              <dd>{order.paymentMethod ?? 'Đang cập nhật'}</dd>
            </div>
            <div>
              <dt>Thời gian đặt</dt>
              <dd>{new Date(order.placedAt).toLocaleString('vi-VN')}</dd>
            </div>
          </dl>
          
        </article>

        <article className="order-detail-card">
          <h3>Chi tiết món ăn</h3>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <div>
                  <p>{item.name}</p>
                  <span>x{item.quantity}</span>
                </div>
                <strong>{(item.price * item.quantity).toLocaleString()} đ</strong>
              </li>
            ))}
          </ul>
          <footer className="order-total">
            <span>Tổng cộng</span>
            <strong>{order.total.toLocaleString()} đ</strong>
          </footer>
          {status === 'pending' && (
            <button type="button" className="cancel-order-button" onClick={() => setShowCancelModal(true)}>
              Hủy đơn hàng
            </button>
          )}
        </article>

        <article className="order-detail-card">
          <h3>Nhà hàng chuẩn bị</h3>
          <dl>
            <div>
              <dt>Tên nhà hàng</dt>
              <dd>{restaurant?.name ?? 'Đang cập nhật'}</dd>
            </div>
            <div>
              <dt>Địa chỉ bãi drone</dt>
              <dd>{restaurant?.dronePad ? `${restaurant.address} • ${restaurant.dronePad}` : restaurant?.address ?? 'Đang cập nhật'}</dd>
            </div>
            <div>
              <dt>Liên hệ</dt>
              <dd>{restaurant?.contact ?? 'Đang cập nhật'}</dd>
            </div>
            <div>
              <dt>Drone phụ trách</dt>
              <dd>{order.droneId ?? 'Đang phân bổ'}</dd>
            </div>
          </dl>
        </article>
      </section>

      {status === 'shipping' && (
        <section className="order-tracking">
          <header>
            <h3>Hành trình drone</h3>
            <p>
              Drone đang rời {restaurant?.name ?? 'nhà hàng'} để đến {order.deliveryAddress ?? order.customerAddress}.
            </p>
          </header>
          <div className="mini-map">
            <MapContainer center={restaurantPosition} zoom={14} scrollWheelZoom={false} className="mini-map-frame">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <BoundsFitter start={restaurantPosition} end={deliveryPosition} />
              <Polyline positions={[restaurantPosition, deliveryPosition]} color="#2563eb" weight={4} dashArray="6" />
              <Marker position={restaurantPosition} />
              <Marker position={deliveryPosition} />
              <AnimatedDrone
                start={restaurantPosition}
                end={deliveryPosition}
                onArrive={handleDroneArrive}
                isActive={!droneArrived}
              />
            </MapContainer>
          </div>
          {droneArrived ? (
            <div className="order-actions">
              <p>Drone đã tới nơi, hãy xác nhận khi bạn đã nhận hàng.</p>
              <button type="button" className="primary-button" onClick={handleMarkDelivered}>
                Đã nhận hàng
              </button>
            </div>
          ) : (
            <p className="muted-text">Dự kiến hạ cánh trong vòng 30 giây.</p>
          )}
        </section>
      )}

      {showCancelModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Sau khi hủy, drone sẽ không được điều phối nữa. Bạn chắc chắn chứ?</p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setShowCancelModal(false)}>
                Để sau
              </button>
              <button type="button" className="danger" onClick={handleCancelOrder}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetailPage;
