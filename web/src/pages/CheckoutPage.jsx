import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { useData } from '../hooks/useData.js';

const paymentMethods = ['Ví FoodFast Pay', 'Thẻ tín dụng', 'Chuyển khoản'];
const defaultLandingPosition = { lat: 10.762622, lng: 106.660172 };
const vietnamSuffix = 'Việt Nam';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const ensureVietnamSuffix = (address) => {
  const trimmed = address.trim();
  if (!trimmed) return vietnamSuffix;
  return trimmed.toLowerCase().endsWith(vietnamSuffix.toLowerCase()) ? trimmed : `${trimmed} ${vietnamSuffix}`;
};

const removeVietnamSuffix = (address) => {
  const trimmed = address.trim();
  if (trimmed.toLowerCase().endsWith(vietnamSuffix.toLowerCase())) {
    return trimmed.slice(0, -vietnamSuffix.length).trim();
  }
  return trimmed;
};

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useData();
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState(user?.name ?? '');
  const [recipientEmail, setRecipientEmail] = useState(user?.email ?? '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone ?? '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [addressInput, setAddressInput] = useState(removeVietnamSuffix(user?.address ?? ''));
  const [landingAddress, setLandingAddress] = useState(ensureVietnamSuffix(user?.address ?? ''));
  const [landingPosition, setLandingPosition] = useState(defaultLandingPosition);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [shouldForwardGeocode, setShouldForwardGeocode] = useState(true);
  const orsApiKey = import.meta.env.VITE_ORS_API_KEY;
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  useEffect(() => {
    setAddressInput(removeVietnamSuffix(user?.address ?? ''));
    setLandingAddress(ensureVietnamSuffix(user?.address ?? ''));
    setRecipientName(user?.name ?? '');
    setRecipientEmail(user?.email ?? '');
    setRecipientPhone(user?.phone ?? '');
    setShouldForwardGeocode(true);
  }, [user]);

  useEffect(() => {
    if (!shouldForwardGeocode || !landingAddress.trim()) {
      setGeocodeError('');
      return undefined;
    }

    if (!orsApiKey) {
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
          size: '1',
          'boundary.country': 'VNM'
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
  }, [landingAddress, orsApiKey, shouldForwardGeocode]);

  const handleAddressChange = (event) => {
    const value = event.target.value;
    setAddressInput(value);
    setLandingAddress(ensureVietnamSuffix(value));
    setShouldForwardGeocode(true);
  };

  const reverseGeocodePosition = async (position) => {
    if (!orsApiKey) {
      setGeocodeError('Chưa cấu hình khóa API OpenRouteService để xác định địa chỉ từ vị trí.');
      return;
    }

    try {
      setIsGeocoding(true);
      setGeocodeError('');
      const params = new URLSearchParams({
        api_key: orsApiKey,
        'point.lon': position.lng,
        'point.lat': position.lat,
        size: '1',
        'boundary.country': 'VNM'
      });
      const response = await fetch(`https://api.openrouteservice.org/geocode/reverse?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Reverse geocode request failed');
      }

      const data = await response.json();
      const feature = data?.features?.[0];
      const label = feature?.properties?.label ?? '';
      const displayAddress = removeVietnamSuffix(label) || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      setAddressInput(displayAddress);
      setLandingAddress(ensureVietnamSuffix(displayAddress));
    } catch (error) {
      setGeocodeError('Không thể lấy địa chỉ từ vị trí vừa chọn.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = async (latlng) => {
    setShouldForwardGeocode(false);
    setLandingPosition(latlng);
    await reverseGeocodePosition(latlng);
  };

  const MapPositionUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
      map.setView(position, map.getZoom());
    }, [map, position]);

    return null;
  };

  const ClickableMarker = ({ position, onSelect }) => {
    useMapEvents({
      click: (event) => {
        onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
      }
    });

    return <Marker position={position} />;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirming(true);
  };

  const handleConfirmPayment = () => {
    addOrder({
      customerName: recipientName || user?.name || 'Khách hàng mới',
      customerEmail: recipientEmail || user?.email || 'unknown@foodfast.io',
      customerAddress: landingAddress,
      deliveryAddress: landingAddress,
      deliveryCoordinates: landingPosition,
      paymentMethod,
      items: cartItems,
      total,
      note
    });
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
            <input type="text" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required />
          </label>
          <label className="form-field">
            Email
            <input type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} required />
          </label>
          <label className="form-field">
            Số điện thoại
            <input type="tel" value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} required />
          </label>
          <label className="form-field">
            Địa chỉ drone hạ cánh
            <input type="text" value={addressInput} onChange={handleAddressChange} required />
          </label>
          <div className="map-field">
            <MapContainer
              center={landingPosition}
              zoom={15}
              style={{ height: 300, width: '100%', margin: '20px 0', borderRadius: '10px' }}
              scrollWheelZoom
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPositionUpdater position={landingPosition} />
              <ClickableMarker position={landingPosition} onSelect={handleMapClick} />
            </MapContainer>
            <p className="form-hint">Chạm vào bản đồ để chọn vị trí hạ cánh và đồng bộ với địa chỉ.</p>
            {isGeocoding && <p className="form-hint">Đang xác định tọa độ chính xác...</p>}
            {!orsApiKey && (
              <p className="form-hint error">Chưa cấu hình khóa API OpenRouteService. Thêm biến VITE_ORS_API_KEY để lấy tọa độ chính xác.</p>
            )}
            {geocodeError && <p className="form-hint error">{geocodeError}</p>}
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
