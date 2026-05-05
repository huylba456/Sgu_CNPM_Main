import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import RevenueChart from '../../components/RevenueChart';
import { colors, spacing, typography } from '../../styles/theme';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useOrders } from '../../hooks/useOrders';
import { statusLabels } from '../../constants/statusLabels';
import Button from '../../components/Button';

const AdminRestaurantDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params ?? {};
  const { restaurants } = useRestaurants();
  const { orders } = useOrders();
  const restaurant = restaurants.find((item) => item.id === id);
  const now = useMemo(() => new Date(), []);

  const parsePlacedDate = (order) => new Date(order.placedAt ?? order.createdAt ?? order.updatedAt ?? now);

  const relatedOrders = useMemo(
    () =>
      orders
        .filter((order) => order.restaurantId === id || order.restaurant === restaurant?.name)
        .sort((a, b) => new Date(b.placedAt ?? 0) - new Date(a.placedAt ?? 0)),
    [id, orders, restaurant?.name]
  );

  const totalRevenue = relatedOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const monthlyHistory = useMemo(() => {
    const points = [];
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const value = relatedOrders
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
  }, [now, relatedOrders]);

  if (!restaurant) {
    return (
      <Screen>
        <AppHeader title="Không tìm thấy nhà hàng" />
        <Button label="Quay lại" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title={restaurant.name}
        subtitle={restaurant.address || 'Chưa có địa chỉ'}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <View style={styles.infoGrid}>
          <View>
            <Text style={styles.muted}>Địa chỉ</Text>
            <Text style={styles.value}>{restaurant.address || 'Chưa có địa chỉ'}</Text>
          </View>
          <View>
            <Text style={styles.muted}>Liên hệ</Text>
            <Text style={styles.value}>{restaurant.contact || 'Chưa cập nhật'}</Text>
          </View>
          <View>
            <Text style={styles.muted}>Bãi đáp drone</Text>
            <Text style={styles.value}>{restaurant.dronePad || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View>
            <Text style={styles.muted}>Tổng doanh thu</Text>
            <Text style={styles.highlight}>{totalRevenue.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View>
            <Text style={styles.muted}>Tổng đơn hàng</Text>
            <Text style={styles.highlight}>{relatedOrders.length}</Text>
          </View>
        </View>
      </Card>

      <RevenueChart title="Doanh thu theo tháng" subtitle="6 tháng gần nhất" data={monthlyHistory} />

      <Card style={styles.orderCard}>
        <Text style={styles.sectionTitle}>Đơn hàng gần nhất</Text>
        <View style={styles.orderList}>
          {relatedOrders.length === 0 ? (
            <Text style={styles.muted}>Chưa có đơn hàng nào.</Text>
          ) : (
            relatedOrders.slice(0, 6).map((order) => (
              <View key={order.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.orderTitle}>Đơn {order.code ?? order.id}</Text>
                  <Text style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                    {statusLabels[order.status] ?? order.status}
                  </Text>
                </View>
                <Text style={styles.muted}>Khách: {order.customerName ?? 'Ẩn danh'}</Text>
                <Text style={styles.muted}>
                  Tổng tiền: {Number(order.total ?? 0).toLocaleString('vi-VN')} đ • {parsePlacedDate(order).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    gap: spacing.md
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text
  },
  infoGrid: {
    gap: spacing.sm
  },
  muted: {
    color: colors.textMuted
  },
  value: {
    color: colors.text
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  highlight: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.subtitle
  },
  orderCard: {
    gap: spacing.md
  },
  orderList: {
    gap: spacing.sm
  },
  historyCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    gap: spacing.xs,
    backgroundColor: colors.surface
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderTitle: {
    color: colors.text,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    fontSize: typography.small,
    overflow: 'hidden',
    color: colors.text
  },
  status_pending: {
    backgroundColor: 'rgba(250,204,21,0.2)',
    color: colors.warning
  },
  status_preparing: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    color: colors.primarySoft
  },
  status_shipping: {
    backgroundColor: 'rgba(34,211,238,0.2)',
    color: colors.accent
  },
  status_delivered: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    color: colors.success
  },
  status_cancelled: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    color: colors.danger
  }
});

export default AdminRestaurantDetailScreen;
