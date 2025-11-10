import { useEffect, useMemo, useState } from 'react';
import { mockRoutes } from '../data/mockRoutes.js';

const DroneTracker = () => {
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [step, setStep] = useState(0);

  const route = useMemo(() => mockRoutes[activeRouteIndex], [activeRouteIndex]);
  const progress = Math.min(100, Math.round(((step + 1) / route.points.length) * 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev + 1 === route.points.length) {
          setActiveRouteIndex((index) => (index + 1) % mockRoutes.length);
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
