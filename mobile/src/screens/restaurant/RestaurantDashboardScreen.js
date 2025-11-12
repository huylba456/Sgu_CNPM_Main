import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import StatHighlight from '../../components/StatHighlight';
import { colors, spacing, typography } from '../../styles/theme';
import { restaurants } from '../../data/mockRestaurants';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { statusLabels } from '../../data/mockOrders';
import Chip from '../../components/Chip';
import Button from '../../components/Button';

const RestaurantDashboardScreen = () => {
  const { user } = useAuth();
  const { orders, getStats } = useOrders();
  const navigation = useNavigation();
  const isAdmin = user?.role === 'admin';
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id ?? '');

  const restaurantSummaries = useMemo(
    () =>
      restaurants.map((restaurant) => {
        const assignedOrders = orders
          .filter((order) => order.restaurantId === restaurant.id)
          .slice()
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
        const stats = getStats(assignedOrders);
        const revenue = assignedOrders.reduce((sum, order) => sum + order.total, 0);
        const inProgress = assignedOrders.filter((order) =>
          ['pending', 'preparing', 'shipping'].includes(order.status)
        ).length;

        return { ...restaurant, stats, revenue, inProgress, orders: assignedOrders };
      }),
    [orders, getStats]
  );

  const fallbackRestaurant = restaurants[0];
  const restaurant = restaurants.find((item) => item.id === user?.restaurantId) ?? fallbackRestaurant;

  const restaurantOrders = useMemo(
    () =>
      orders
        .filter((order) => order.restaurantId === restaurant.id)
        .slice()
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [orders, restaurant.id]
  );

  const revenue = restaurantOrders.reduce((sum, order) => sum + order.total, 0);
  const inProgress = restaurantOrders.filter((order) =>
    ['pending', 'preparing', 'shipping'].includes(order.status)
  ).length;

  const totalRevenue = restaurantSummaries.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = restaurantSummaries.reduce((sum, item) => sum + item.stats.total, 0);
  const selectedRestaurant =
    restaurantSummaries.find((item) => item.id === selectedRestaurantId) ?? restaurantSummaries[0];

  return (
    <Screen>
      {isAdmin ? (
        <>
          <AppHeader
            title="Hệ thống nhà hàng"
            subtitle="Theo dõi hiệu suất và tình trạng của các bếp đối tác FoodFast."
          />

          <View style={styles.statRow}>
            <StatHighlight label="Tổng nhà hàng" value={restaurants.length} />
            <StatHighlight label="Tổng đơn" value={totalOrders} tone="accent" />
            <StatHighlight label="Doanh thu" value={`${totalRevenue.toLocaleString('vi-VN')} đ`} />
          </View>

          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Chọn nhà hàng</Text>
            <View style={styles.categoryRow}>
              {restaurantSummaries.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  active={selectedRestaurantId === item.id}
                  onPress={() => setSelectedRestaurantId(item.id)}
                />
              ))}
            </View>
          </Card>

          {selectedRestaurant ? (
            <Card style={styles.panel}>
              <View style={styles.restaurantHeader}>
                <View>
                  <Text style={styles.panelTitle}>{selectedRestaurant.name}</Text>
                  <Text style={styles.panelMeta}>
                    Drone pad: {selectedRestaurant.dronePad} • Liên hệ: {selectedRestaurant.contact}
                  </Text>
                  <Text style={styles.panelMeta}>Địa chỉ: {selectedRestaurant.address}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <StatHighlight label="Tổng đơn" value={selectedRestaurant.stats.total} />
                <StatHighlight label="Đang xử lý" value={selectedRestaurant.inProgress} tone="accent" />
                <StatHighlight
                  label="Doanh thu"
                  value={`${selectedRestaurant.revenue.toLocaleString('vi-VN')} đ`}
                  tone="success"
                />
              </View>
              {selectedRestaurant.orders.length > 0 ? (
                <View style={styles.orderList}>
                  {selectedRestaurant.orders.map((order) => (
                    <View key={order.id} style={styles.orderRow}>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.customer}>{order.customerName}</Text>
                      <Text style={[styles.status, styles[`status_${order.status}`]]}>
                        {statusLabels[order.status] ?? order.status}
                      </Text>
                      <Text style={styles.total}>{order.total.toLocaleString('vi-VN')} đ</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>Chưa có đơn hàng nào cho nhà hàng này.</Text>
              )}
            </Card>
          ) : null}

          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Tổng quan nhà hàng</Text>
            {restaurantSummaries.map((item) => (
              <View key={item.id} style={styles.overviewRow}>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewName}>{item.name}</Text>
                  <Text style={styles.panelMeta}>Drone pad: {item.dronePad}</Text>
                  <Text style={styles.panelMeta}>Liên hệ: {item.contact}</Text>
                </View>
                <View style={styles.overviewStats}>
                  <Text style={styles.overviewStat}>Đơn: {item.stats.total}</Text>
                  <Text style={styles.overviewStat}>Đang xử lý: {item.inProgress}</Text>
                  <Text style={styles.overviewStat}>
                    Doanh thu: {item.revenue.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <>
          <AppHeader
            title={restaurant.name}
            subtitle={`Drone pad: ${restaurant.dronePad} • Liên hệ: ${restaurant.contact}`}
          />

          <View style={styles.statRow}>
            <StatHighlight label="Doanh thu" value={`${revenue.toLocaleString('vi-VN')} đ`} />
            <StatHighlight label="Đơn đang xử lý" value={inProgress} tone="accent" />
            <StatHighlight label="Đánh giá" value="4.6/5" helpText="98% khách hài lòng" />
          </View>

          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Tác vụ nhanh</Text>
            <View style={styles.actionGrid}>
              <Button
                label="Quản lý món"
                variant="ghost"
                onPress={() => navigation.navigate('RestaurantProducts')}
              />
              <Button
                label="Quản lý đơn"
                variant="ghost"
                onPress={() => navigation.navigate('RestaurantOrders')}
              />
            </View>
          </Card>

          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Đơn gần đây</Text>
            {restaurantOrders.map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.customer}>{order.customerName}</Text>
                <Text style={[styles.status, styles[`status_${order.status}`]]}>
                  {statusLabels[order.status] ?? order.status}
                </Text>
                <Text style={styles.total}>{order.total.toLocaleString('vi-VN')} đ</Text>
              </View>
            ))}
          </Card>
        </>
      )}
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
  panelMeta: {
    color: colors.textMuted
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  restaurantHeader: {
    gap: spacing.xs
  },
  orderList: {
    gap: spacing.sm
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  orderId: {
    color: colors.text,
    fontWeight: '600'
  },
  customer: {
    color: colors.textMuted,
    flex: 1,
    marginLeft: spacing.sm
  },
  status: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    fontSize: typography.small,
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
  },
  total: {
    color: colors.accent,
    fontWeight: '700'
  },
  overviewRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  overviewInfo: {
    flex: 1,
    gap: spacing.xs
  },
  overviewName: {
    color: colors.text,
    fontWeight: '600'
  },
  overviewStats: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xs
  },
  overviewStat: {
    color: colors.textMuted
  },
  emptyText: {
    color: colors.textMuted
  }
});

export default RestaurantDashboardScreen;
