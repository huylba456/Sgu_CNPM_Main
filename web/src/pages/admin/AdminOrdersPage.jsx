import { useMemo, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { useData } from '../../hooks/useData.js';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const AdminOrdersPage = () => {
  const { orders, updateOrder } = useData();
  const [filters, setFilters] = useState({ status: 'all', search: '' });

  const getAvailableStatuses = (current) => {
    if (current === 'pending') return statuses.filter((status) => ['pending', 'preparing'].includes(status.value));
    if (current === 'preparing') return statuses.filter((status) => ['preparing', 'shipping'].includes(status.value));
    return statuses.filter((status) => status.value === current);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const code = (order.code ?? order.id ?? '').toLowerCase();
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      if (filters.search) {
        const keyword = filters.search.toLowerCase();
        return (
          code.includes(keyword) ||
          order.customerName.toLowerCase().includes(keyword) ||
          order.customerEmail.toLowerCase().includes(keyword)
        );
      }
      return true;
    });
  }, [filters, orders]);

  const columns = useMemo(
    () => [
      { header: 'Mã đơn', cell: ({ row }) => row.original.code ?? row.original.id },
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
        header: 'Drone',
        cell: ({ row }) => row.original.droneId ?? 'Đang phân bổ'
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

  const handleStatusChange = (id, status) => updateOrder(id, { status });

  const handleNoteChange = (id, note) => updateOrder(id, { note });

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
