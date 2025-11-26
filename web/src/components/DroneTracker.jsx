import { useEffect, useMemo, useState } from 'react';
import { useData } from '../hooks/useData.js';

const fallbackRoutes = [
  {
    orderId: '#D-001',
    restaurant: 'Drone Hub Bistro',
    customer: 'Khách hàng',
    points: [
      { lat: 90, lng: 10 },
      { lat: 70, lng: 30 },
      { lat: 55, lng: 45 },
      { lat: 35, lng: 65 },
      { lat: 20, lng: 80 }
    ]
  }
];

const DroneTracker = () => {
  const { orders } = useData();
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [step, setStep] = useState(0);

  const routes = useMemo(() => {
    const shippingOrders = orders.filter((order) => order.status === 'shipping');
    if (!shippingOrders.length) return fallbackRoutes;

    return shippingOrders.map((order) => ({
      orderId: `#${order.code ?? order.id}`,
      restaurant: order.restaurant ?? order.restaurantName ?? order.items?.[0]?.restaurant ?? 'Nhà hàng',
      customer: order.customerName ?? 'Khách hàng',
      points: [
        { lat: 90, lng: 10 },
        { lat: 70, lng: 30 },
        { lat: 55, lng: 45 },
        { lat: 35, lng: 65 },
        { lat: 20, lng: 80 }
      ]
    }));
  }, [orders]);

  const route = useMemo(() => routes[activeRouteIndex % routes.length], [activeRouteIndex, routes]);
  const progress = Math.min(100, Math.round(((step + 1) / route.points.length) * 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev + 1 === route.points.length) {
          setActiveRouteIndex((index) => (index + 1) % routes.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [route.points.length]);

  return (
    <div className="tracker-card">
      <h3>Drone đang giao</h3>
      <p className="muted">{route.orderId} • {route.restaurant} → {route.customer}</p>
      <div className="map">
        {route.points.map((point, index) => (
          <div
            key={`${point.lat}-${point.lng}-${index}`}
            className={`map-point ${index === step ? 'active' : ''}`}
            style={{
              left: `${point.lng}%`,
              top: `${100 - point.lat}%`
            }}
          />
        ))}
        <div className="map-start">Trạm</div>
        <div className="map-end">Bạn</div>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="muted">Tiến độ: {progress}%</p>
    </div>
  );
};

export default DroneTracker;
