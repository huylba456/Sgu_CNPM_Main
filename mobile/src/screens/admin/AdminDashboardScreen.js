import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatHighlight from '../../components/StatHighlight';
import { colors, spacing, typography } from '../../styles/theme';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { statusLabels } from '../../constants/statusLabels';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { orders, drones } = useOrders();
  const { products } = useProducts();
  const { users } = useAuth();
  const sortedOrders = useMemo(
    () => orders.slice().sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [orders]
  );

  const now = useMemo(() => new Date(), []);
  const startOfDay = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const startOfTomorrow = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    [now]
  );
  const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const startOfNextMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 1), [now]);
  const startOfPreviousMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);
  const customerCutoff = useMemo(() => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), [now]);
  const previousCustomerCutoff = useMemo(
    () => new Date(customerCutoff.getTime() - 30 * 24 * 60 * 60 * 1000),
    [customerCutoff]
  );

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

  const revenueTrend = useMemo(() => {
    if (!previousMonthRevenue) return 'Tháng trước không có dữ liệu';
    const delta = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% so với tháng trước`;
  }, [monthlyRevenue, previousMonthRevenue]);

  const todayOrders = useMemo(
    () =>
      orders.filter((order) => {
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

  const recentCustomerCount = useMemo(() => {
    const unique = new Set();
    orders.forEach((order) => {
      const placedDate = parsePlacedDate(order);
      if (placedDate >= customerCutoff) {
        unique.add(order.customerEmail ?? order.customerName);
      }
    });
    return unique.size;
  }, [customerCutoff, orders]);

  const previousCustomerCount = useMemo(() => {
    const unique = new Set();
    orders.forEach((order) => {
      const placedDate = parsePlacedDate(order);
      if (placedDate >= previousCustomerCutoff && placedDate < customerCutoff) {
        unique.add(order.customerEmail ?? order.customerName);
      }
    });
    return unique.size;
  }, [customerCutoff, orders, previousCustomerCutoff]);

  const customerTrend = useMemo(() => {
    if (!previousCustomerCount) return '30 ngày gần nhất';
    const delta = ((recentCustomerCount - previousCustomerCount) / previousCustomerCount) * 100;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs kỳ trước`;
  }, [previousCustomerCount, recentCustomerCount]);

  const latestOrders = sortedOrders.slice(0, 3);
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <Screen>
      <AppHeader title="Dashboard tổng quan" subtitle="Theo dõi hiệu suất đội drone và đơn hàng trong ngày." />

      <View style={styles.statRow}>
        <StatHighlight
          label="Doanh thu tháng"
          value={`${monthlyRevenue.toLocaleString('vi-VN')} đ`}
          helpText={revenueTrend}
        />
        <StatHighlight
          label="Đơn hàng hôm nay"
          value={todayOrders.length}
          helpText={`Hôm qua: ${yesterdayOrderCount} đơn`}
          tone="accent"
        />
        <StatHighlight
          label="Khách hàng mới"
          value={recentCustomerCount}
          helpText={customerTrend}
          tone="success"
        />
      </View>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Tác vụ nhanh</Text>
        <View style={styles.actionGrid}>
          <Button
            label="Quản lý món"
            variant="ghost"
            onPress={() => navigation.navigate('AdminProducts')}
          />
          <Button
            label="Quản lý đơn"
            variant="ghost"
            onPress={() => navigation.navigate('AdminOrders')}
          />
          <Button
            label="Quản lý tài khoản"
            variant="ghost"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <Button
            label="Đội drone"
            variant="ghost"
            onPress={() => navigation.navigate('AdminDrones')}
          />
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Đơn hàng gần nhất</Text>
        <View style={styles.orderList}>
          {latestOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View style={styles.orderHeaderRow}>
                <Text style={styles.orderId}>Đơn {order.code ?? order.id}</Text>
                <Text style={styles.orderTotal}>
                  {Number(order.total ?? 0).toLocaleString('vi-VN')} đ
                </Text>
              </View>
              <Text style={styles.orderCustomer}>Khách hàng: {order.customerName ?? 'Ẩn danh'}</Text>
              <View style={styles.orderMetaRow}>
                <Text style={styles.orderStatus}>{statusLabels[order.status] ?? order.status}</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.orderStatus}>Drone: {order.droneId ?? 'Chưa gán'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Món ăn được yêu thích</Text>
        {topProducts.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productRestaurant}>{product.restaurant}</Text>
            </View>
            <Text style={styles.productRating}>{product.rating.toFixed(1)}/5</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Đội drone</Text>
        {drones.map((drone) => (
          <View key={drone.id} style={styles.productRow}>
            <View>
              <Text style={styles.productName}>{drone.id}</Text>
              <Text style={styles.productRestaurant}>Tình trạng: {drone.status}</Text>
            </View>
            <Text style={styles.productRating}>{drone.battery}% pin</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Tài khoản hệ thống</Text>
        <Text style={styles.metaText}>Khách hàng: {users.filter((user) => user.role === 'customer').length}</Text>
        <Text style={styles.metaText}>Nhà hàng: {users.filter((user) => user.role === 'restaurant').length}</Text>
        <Text style={styles.metaText}>Quản trị viên: {users.filter((user) => user.role === 'admin').length}</Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  panel: {
    gap: spacing.md
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  panelTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  orderList: {
    gap: spacing.sm
  },
  orderRow: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  orderId: {
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1
  },
  orderCustomer: {
    color: colors.textMuted,
    flexShrink: 1
  },
  orderStatus: {
    color: colors.textMuted
  },
  orderMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center'
  },
  orderTotal: {
    color: colors.accent,
    fontWeight: '600'
  },
  metaSeparator: {
    color: colors.textMuted
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productName: {
    color: colors.text,
    fontWeight: '600'
  },
  productRestaurant: {
    color: colors.textMuted
  },
  productRating: {
    color: colors.accent,
    fontWeight: '700'
  },
  metaText: {
    color: colors.textMuted
  }
});

export default AdminDashboardScreen;
