import { createContext, useMemo, useState } from 'react';
import { initialOrders } from '../data/mockOrders';

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrders);

  const updateOrderStatus = (id, status) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));

  const assignDrone = (id, droneId) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, droneId } : order)));

  const addOrderNote = (id, note) =>
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, note } : order)));

  const value = useMemo(
    () => ({ orders, setOrders, updateOrderStatus, assignDrone, addOrderNote }),
    [orders]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
