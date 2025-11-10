import { useMemo, useState } from 'react';
import { initialOrders } from '../data/mockOrders.js';

export const useOrders = () => {
  const [orders, setOrders] = useState(initialOrders);

  const updateOrderStatus = (id, status) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));

  const assignDrone = (id, droneId) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, droneId } : order)));

  const addOrderNote = (id, note) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, note } : order)));

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((order) => order.status === 'delivered').length;
    const inFlight = orders.filter((order) => order.status === 'in_transit').length;
    const cancelled = orders.filter((order) => order.status === 'cancelled').length;

    return {
      total,
      delivered,
      inFlight,
      cancelled
    };
  }, [orders]);

  return {
    orders,
    setOrders,
    updateOrderStatus,
    assignDrone,
    addOrderNote,
    stats
  };
};
