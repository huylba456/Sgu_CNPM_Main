import { useMemo } from 'react';
import StatsCard from '../../components/StatsCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import RevenueChart from '../../components/RevenueChart.jsx';
import { useData } from '../../hooks/useData.js';

const AdminDashboardPage = () => {
  const { products, orders } = useData();
  const latestOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
        .map((item) => ({ name: item.name, restaurant: item.restaurant, rating: item.rating })),
    [products]
  );

  const columns = [
    {
      header: 'Món ăn',
      accessorKey: 'name'
    },
    {
      header: 'Nhà hàng',
      accessorKey: 'restaurant'
    },
    {
      header: 'Đánh giá',
      accessorKey: 'rating'
    }
  ];

  // const openCreateDrone = () => {
  //   setDroneForm({
  //     id: '',
  //     status: 'Hoạt động',
  //     battery: 100,
  //     dailyDeliveries: 0,
  //     totalDeliveries: 0,
  //     distance: 0
  //   });
  //   setEditingDroneId(null);
  //   setIsDroneModalOpen(true);
  // };

  // const openEditDrone = (drone) => {
  //   setDroneForm({ ...drone });
  //   setEditingDroneId(drone.id);
  //   setIsDroneModalOpen(true);
  // };

  // const confirmDeleteDrone = (drone) => {
  //   setDroneToDelete(drone);
  // };

  const now = useMemo(() => new Date(), []);
  const startOfDay = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const startOfTomorrow = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    [now]
  );
  const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const startOfNextMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 1), [now]);
  const startOfPreviousMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);

  const parsePlacedDate = (order) => new Date(order.placedAt ?? order.createdAt ?? order.updatedAt ?? now);

  const monthlyRevenue = useMemo(
    () =>
      orders
        .filter((order) => {
          const placedDate = parsePlacedDate(order);
          return placedDate >= startOfMonth && placedDate < startOfNextMonth;
        })
        .reduce((sum, order) => sum + order.total, 0),
    [orders, startOfMonth, startOfNextMonth]
  );

  const previousMonthRevenue = useMemo(
    () =>
      orders
        .filter((order) => {
          const placedDate = parsePlacedDate(order);
          return placedDate >= startOfPreviousMonth && placedDate < startOfMonth;
        })
        .reduce((sum, order) => sum + order.total, 0),
    [orders, startOfMonth, startOfPreviousMonth]
  );

  const revenueDelta = useMemo(() => {
    if (!previousMonthRevenue) return null;
    const change = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    const formatted = change.toFixed(1);
    return `${change >= 0 ? '+' : ''}${formatted}% so với tháng trước`;
  }, [monthlyRevenue, previousMonthRevenue]);

  const todayOrders = useMemo(
    () => orders.filter((order) => {
      const placedDate = parsePlacedDate(order);
      return placedDate >= startOfDay && placedDate < startOfTomorrow;
    }),
    [orders, startOfDay, startOfTomorrow]
  );

  const startOfYesterday = useMemo(() => new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000), [startOfDay]);
  const endOfYesterday = startOfDay;
  const yesterdayOrderCount = useMemo(
    () =>
      orders.filter((order) => {
        const placedDate = parsePlacedDate(order);
        return placedDate >= startOfYesterday && placedDate < endOfYesterday;
      }).length,
    [endOfYesterday, orders, startOfYesterday]
  );

  const customerCutoff = useMemo(() => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), [now]);
  const previousCustomerCutoff = useMemo(
    () => new Date(customerCutoff.getTime() - 30 * 24 * 60 * 60 * 1000),
    [customerCutoff]
  );

  const recentCustomerCount = useMemo(() => {
    const uniqueCustomers = new Set();
    orders.forEach((order) => {
      const placedDate = parsePlacedDate(order);
      if (placedDate >= customerCutoff) {
        uniqueCustomers.add(order.customerEmail ?? order.customerName);
      }
    });
    return uniqueCustomers.size;
  }, [customerCutoff, orders]);

  const previousCustomerCount = useMemo(() => {
    const uniqueCustomers = new Set();
    orders.forEach((order) => {
      const placedDate = parsePlacedDate(order);
      if (placedDate >= previousCustomerCutoff && placedDate < customerCutoff) {
        uniqueCustomers.add(order.customerEmail ?? order.customerName);
      }
    });
    return uniqueCustomers.size;
  }, [customerCutoff, orders, previousCustomerCutoff]);

  const customerTrend = useMemo(() => {
    if (!previousCustomerCount) return null;
    const change = ((recentCustomerCount - previousCustomerCount) / previousCustomerCount) * 100;
    const formatted = change.toFixed(1);
    return `${change >= 0 ? '+' : ''}${formatted}% so với 30 ngày trước`;
  }, [previousCustomerCount, recentCustomerCount]);

  const monthlyHistory = useMemo(() => {
    const points = [];
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const value = orders
        .filter((order) => {
          const placedDate = parsePlacedDate(order);
          return placedDate >= start && placedDate < end;
        })
        .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

      points.push({
        label: `${start.getMonth() + 1}/${start.getFullYear().toString().slice(-2)}`,
        value
      });
    }
    return points;
  }, [now, orders]);

  return (
    <div className="page dashboard">
      <h2>Dashboard tổng quan</h2>
      <div className="stat-grid">
        <StatsCard
          title="Tổng doanh thu tháng"
          value={`₫ ${monthlyRevenue.toLocaleString()}`}
          trend={revenueDelta}
        />
        <StatsCard
          title="Đơn hàng trong ngày"
          value={todayOrders.length}
          trend={`Hôm qua: ${yesterdayOrderCount} đơn`}
        />
        <StatsCard
          title="Khách hàng mới"
          value={recentCustomerCount}
          trend={customerTrend ?? '30 ngày gần nhất'}
        />
      </div>
      <RevenueChart title="Xu hướng doanh thu" subtitle="6 tháng gần nhất" data={monthlyHistory} />
      <section className="panel">
        <h3>Đơn hàng gần nhất</h3>
        <div className="order-list compact">
          {latestOrders.map((order) => (
            <div key={order.id} className="order-card compact">
              <h4>{order.code ?? order.id}</h4>
              <p>{order.customerName}</p>
              <p className={`status ${order.status}`}>{order.status}</p>
              <span>{order.total.toLocaleString()} đ</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3>Món ăn được yêu thích</h3>
        <DataTable columns={columns} data={topProducts} />
      </section>
      {/* Phần quản lý đội drone có thể được bật lại khi cần hiển thị chi tiết đội bay */}
    </div>
  );
};

export default AdminDashboardPage;
