import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { initialOrders } from '../../data/mockOrders.js';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [filters, setFilters] = useState({ status: 'all', search: '' });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        return (
          order.id.toLowerCase().includes(keyword) ||
          order.customerName.toLowerCase().includes(keyword) ||
          order.customerEmail.toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  }, [filters, orders]);

  const columns = useMemo(
    () => [
      { header: 'Mã đơn', accessorKey: 'id' },
      { header: 'Khách hàng', accessorKey: 'customerName' },
      {
        header: 'Tổng tiền',
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
        header: 'Drone',
        cell: ({ row }) => (
          <input
            value={row.original.droneId ?? ''}
            onChange={(event) => handleDroneAssign(row.original.id, event.target.value)}
            placeholder="Mã drone"
          />
        )
      },
      {
        header: 'Ghi chú',
        cell: ({ row }) => (
          <input
            value={row.original.note ?? ''}
            onChange={(event) => handleNoteChange(row.original.id, event.target.value)}
            placeholder="Ghi chú nội bộ"
          />
        )
      }
    ],
    [filteredOrders]
  );

  const handleStatusChange = (id, status) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const handleDroneAssign = (id, droneId) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, droneId } : order)));
  };

  const handleNoteChange = (id, note) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, note } : order)));
  };

  return (
    <div className="page dashboard">
      <h2>Quản lý đơn hàng</h2>
      <div className="filters">
        <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
          <option value="all">Tất cả trạng thái</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Tìm mã đơn hoặc khách hàng"
          value={filters.search}
          className="order-search-input"
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
      </div>
      <DataTable columns={columns} data={filteredOrders} />
    </div>
  );
};

export default AdminOrdersPage;
