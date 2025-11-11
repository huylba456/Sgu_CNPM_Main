import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { initialOrders } from '../../data/mockOrders.js';
import { useAuth } from '../../hooks/useAuth.js';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const RestaurantOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(
    initialOrders.filter((order) => order.restaurantId === (user?.restaurantId ?? 'r1'))
  );

  const columns = useMemo(
    () => [
      { header: 'Mã đơn', accessorKey: 'id' },
      { header: 'Khách hàng', accessorKey: 'customerName' },
      {
        header: 'Tổng',
        cell: ({ row }) => `${row.original.total.toLocaleString()} đ`
      },
      {
        header: 'Trạng thái',
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(event) => handleStatusChange(row.original.id, event.target.value)}
          >
            {statuses.map((status) => (
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

  const handleStatusChange = (id, status) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const handleNoteChange = (id, note) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, note } : order)));
  };

  return (
    <div className="page dashboard">
      <h2>Đơn hàng của nhà hàng</h2>
      <DataTable columns={columns} data={orders} />
    </div>
  );
};

export default RestaurantOrdersPage;
