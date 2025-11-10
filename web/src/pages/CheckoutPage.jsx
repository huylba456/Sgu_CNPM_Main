import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const paymentMethods = ['Ví FoodFast Pay', 'Thẻ tín dụng', 'Chuyển khoản'];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const defaultLandingPosition = { lat: 10.762622, lng: 106.660172 };

const MapUpdater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.flyTo(position, map.getZoom(), { duration: 0.4 });
  }, [map, position]);

  return null;
};

const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (event) => {
      onClick(event.latlng);
    }
  });

  return null;
};

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [landingAddress, setLandingAddress] = useState(user?.address ?? '');
  const [landingPosition, setLandingPosition] = useState(defaultLandingPosition);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const orsApiKey = import.meta.env.VITE_ORS_API_KEY;
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  useEffect(() => {
    setLandingAddress(user?.address ?? '');
  }, [user]);

  useEffect(() => {
    if (!orsApiKey || !landingAddress.trim()) {
      setGeocodeError('');
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        setGeocodeError('');
        const params = new URLSearchParams({
          api_key: orsApiKey,
          text: landingAddress,
          size: '1'
        });
        const response = await fetch(`https://api.openrouteservice.org/geocode/search?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Geocode request failed');
        }

        const data = await response.json();
        const feature = data?.features?.[0];

        if (feature?.geometry?.coordinates?.length === 2) {
          const [longitude, latitude] = feature.geometry.coordinates;
          setLandingPosition({ lat: latitude, lng: longitude });
        } else {
          setGeocodeError('Không tìm thấy vị trí tương ứng với địa chỉ này.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setGeocodeError('Không thể tìm địa chỉ trên bản đồ ngay lúc này.');
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [landingAddress, orsApiKey]);

  const handleMapClick = useCallback(
    async ({ lat, lng }) => {
      if (!orsApiKey) {
        return;
      }

      setLandingPosition({ lat, lng });
      setIsReverseGeocoding(true);
      setGeocodeError('');

      try {
        const params = new URLSearchParams({
          api_key: orsApiKey,
          'point.lat': lat,
          'point.lon': lng,
          size: '1'
        });
        const response = await fetch(`https://api.openrouteservice.org/geocode/reverse?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Reverse geocode failed');
        }

        const data = await response.json();
        const label = data?.features?.[0]?.properties?.label;

        if (label) {
          setLandingAddress(label);
        } else {
          setGeocodeError('Không thể xác định địa chỉ từ vị trí đã chọn.');
        }
      } catch (error) {
        setGeocodeError('Không thể xác định địa chỉ từ vị trí đã chọn.');
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [orsApiKey]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirming(true);
  };

  const handleConfirmPayment = () => {
    setIsConfirming(false);
    clearCart();
    navigate('/orders', {
      state: {
        message: 'Đơn hàng đã được tạo thành công! Drone sẽ cất cánh trong ít phút.'
      }
    });
  };

  const handleCancelConfirmation = () => {
    setIsConfirming(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <h2>Không có món nào trong giỏ hàng</h2>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Thanh toán</h2>
      <form className="form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Thông tin nhận hàng</legend>
          <label className="form-field">
            Tên người nhận
            <input type="text" defaultValue={user?.name ?? ''} required />
          </label>
          <label className="form-field">
            Email
            <input type="email" defaultValue={user?.email ?? ''} required />
          </label>
          <label className="form-field">
            Số điện thoại
            <input type="tel" defaultValue={user?.phone ?? ''} required />
          </label>
          <label className="form-field">
            Địa chỉ drone hạ cánh
            <input type="text" value={landingAddress} onChange={(event) => setLandingAddress(event.target.value)} required />
          </label>
          <div className="map-field">
            {orsApiKey ? (
              <>
                <MapContainer center={landingPosition} zoom={16} scrollWheelZoom={false} className="map-preview">
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={landingPosition} />
                  <MapUpdater position={landingPosition} />
                  <MapClickHandler onClick={handleMapClick} />
                </MapContainer>
                <p className="form-hint">Chạm vào bản đồ để chọn vị trí mới hoặc nhập địa chỉ để đồng bộ.</p>
                {(isGeocoding || isReverseGeocoding) && <p className="form-hint">Đang đồng bộ với bản đồ...</p>}
                {geocodeError && <p className="form-hint error">{geocodeError}</p>}
              </>
            ) : (
              <p className="form-hint error">Chưa cấu hình khóa API OpenRouteService. Thêm biến VITE_ORS_API_KEY để hiển thị bản đồ.</p>
            )}
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>Phương thức thanh toán</legend>
          <label className="form-field">
            Phương thức
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
            </select>
          </label>
          <label className="form-field">
            Ghi chú cho phi hành đoàn
            <textarea value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </fieldset>
        <section className="order-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} x {item.quantity}{' '}
                <span>{(item.price * item.quantity).toLocaleString()} đ</span>
              </li>
            ))}
          </ul>
          <p className="total">Tổng cộng: {total.toLocaleString()} đ</p>
          <p className="muted">Drone dự kiến đến trong 12 phút.</p>
        </section>
        <button type="submit" className="primary">
          Xác nhận thanh toán
        </button>
      </form>
      {isConfirming && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Bạn có muốn thanh toán?</h3>
            <p>Đơn hàng sẽ được gửi tới phi hành đoàn drone để xử lý ngay sau khi bạn xác nhận.</p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={handleCancelConfirmation}>
                Không
              </button>
              <button type="button" className="primary" onClick={handleConfirmPayment}>
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
