import { useCallback, useContext, useMemo } from 'react';
import { OrdersContext } from '../context/OrdersContext';

export const useOrders = () => {
  const { orders, setOrders, updateOrderStatus, assignDrone, addOrderNote } = useContext(OrdersContext);

  const getStats = useCallback(
    (source) => {
      const list = Array.isArray(source) ? source : orders;
      const total = list.length;
      const delivered = list.filter((order) => order.status === 'delivered').length;
      const shipping = list.filter((order) => order.status === 'shipping').length;
      const cancelled = list.filter((order) => order.status === 'cancelled').length;

      return {
        total,
        delivered,
        shipping,
        cancelled
      };
    },
    [orders]
  );

  const stats = useMemo(() => getStats(), [getStats]);

  return {
    orders,
    setOrders,
    updateOrderStatus,
    assignDrone,
    addOrderNote,
    stats,
    getStats
  };
};
