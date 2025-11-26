import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useData } from '../../hooks/useData.js';
import { useRestaurants } from '../../hooks/useRestaurants.js';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const RestaurantOrdersPage = () => {
  const { user } = useAuth();
  const { orders: allOrders, updateOrder } = useData();
  const { restaurants } = useRestaurants();
  const restaurantId = useMemo(() => {
    if (user?.restaurantId) return user.restaurantId;
    if (user?.restaurantName) {
      return restaurants.find((item) => item.name === user.restaurantName)?.id ?? '';
    }
    return '';
  }, [restaurants, user?.restaurantId, user?.restaurantName]);
  const [orders, setOrders] = useState([]);

  const getAvailableStatuses = (current) => {
    if (current === 'pending') return statuses.filter((status) => ['pending', 'preparing'].includes(status.value));
    if (current === 'preparing') return statuses.filter((status) => ['preparing', 'shipping'].includes(status.value));
    return statuses.filter((status) => status.value === current);
  };

  const columns = useMemo(
    () => [
      { header: 'Mã đơn', accessorKey: 'id' },
      { header: 'Khách hàng', accessorKey: 'customerName' },
      {
        header: 'Tổng',
        cell: ({ row }) => `${row.original.total.toLocaleString()} đ`
      },
      {
        header: 'Drone',
        accessorKey: 'droneId',
        cell: ({ row }) => row.original.droneId ?? 'Đang phân bổ'
      },
      {
        header: 'Trạng thái',
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(event) => handleStatusChange(row.original.id, event.target.value)}
            disabled={getAvailableStatuses(row.original.status).length <= 1}
          >
            {getAvailableStatuses(row.original.status).map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        )
      },
      {
        header: 'Ghi chú',
        cell: ({ row }) => (
          <input
            value={row.original.note ?? ''}
            onChange={(event) => handleNoteChange(row.original.id, event.target.value)}
          />
        )
      }
    ],
    [orders]
  );

  const handleStatusChange = (id, status) => updateOrder(id, { status });

  const handleNoteChange = (id, note) => updateOrder(id, { note });

  useEffect(() => {
    if (!restaurantId) {
      setOrders([]);
      return;
    }
    setOrders(allOrders.filter((order) => order.restaurantId === restaurantId));
  }, [allOrders, restaurantId]);

  return (
    <div className="page dashboard">
      <h2>Đơn hàng của nhà hàng</h2>
      {!restaurantId ? (
        <div className="alert warning">Tài khoản chưa được gán nhà hàng. Vui lòng liên hệ quản trị.</div>
      ) : null}
      <DataTable columns={columns} data={orders} />
    </div>
  );
};

export default RestaurantOrdersPage;
