import { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import StatHighlight from '../components/StatHighlight';
import Stack from '../components/Stack';
import { colors, spacing, typography } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { statusLabels } from '../constants/statusLabels';

const OrdersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, getStats } = useOrders();

  const visibleOrders = useMemo(() => {
    if (!user) {
      return [];
    }

    return orders
      .filter((order) => {
        if (user.role === 'customer') {
          return order.customerEmail === user.email;
        }
        if (user.role === 'restaurant') {
          return order.restaurantId === user.restaurantId;
        }
        return true;
      })
      .slice()
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [orders, user]);

  const stats = getStats(visibleOrders);

  if (!user) {
    return (
      <Screen>
        <AppHeader title="Đơn hàng" subtitle="Đăng nhập để theo dõi đơn hàng của bạn." />
        <EmptyState title="Bạn cần đăng nhập" description="Đăng nhập để xem và theo dõi trạng thái đơn hàng." />
        <Button label="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </Screen>
    );
  }

  const handleCancel = (id) => {
    Alert.alert('Hủy đơn hàng', 'Bạn có chắc chắn muốn hủy đơn này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: () => updateOrderStatus(id, 'cancelled')
      }
    ]);
  };

  return (
    <Screen>
      <AppHeader title="Đơn hàng của tôi" subtitle="Theo dõi hành trình drone và trạng thái giao hàng." />

      <Stack direction="row" wrap gap={spacing.md}>
        <StatHighlight label="Tổng đơn" value={stats.total} />
        <StatHighlight label="Đã giao" value={stats.delivered} tone="success" />
        <StatHighlight label="Đang giao" value={stats.shipping} tone="accent" />
      </Stack>

      {visibleOrders.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng"
          description="Bạn chưa có đơn hàng nào. Hãy đặt món để trải nghiệm drone delivery."
        />
      ) : (
        visibleOrders.map((order) => (
          <Card key={order.id}>
            <Stack gap={spacing.md}>
              <Stack direction="row" justify="space-between" align="flex-start" wrap>
                <Text style={styles.orderTitle}>Đơn {order.id}</Text>
                <Text style={[styles.status, styles[`status_${order.status}`]]}>
                  {statusLabels[order.status] ?? order.status}
                </Text>
              </Stack>

              <Stack gap={spacing.xs}>
                <Text style={styles.metaText}>Địa chỉ giao: {order.deliveryAddress ?? order.customerAddress}</Text>
                <Text style={styles.metaText}>Thanh toán: {order.paymentMethod ?? 'Đang cập nhật'}</Text>
                <Text style={styles.metaText}>Drone phụ trách: {order.droneId ?? 'Đang phân bổ'}</Text>
                <Text style={styles.metaText}>
                  Thời gian đặt: {new Date(order.placedAt).toLocaleString('vi-VN')}
                </Text>
              </Stack>

              <Stack gap={spacing.xs}>
                {order.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.name} x{item.quantity}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                ))}
              </Stack>

              <Stack direction="row" justify="space-between" align="center">
                <Text style={styles.total}>Tổng: {order.total.toLocaleString('vi-VN')} đ</Text>
                <Stack direction="row" wrap gap={spacing.sm} justify="flex-end">
                  <Button
                    label="Xem chi tiết"
                    variant="ghost"
                    onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                  />
                  {user.role === 'customer' && order.status === 'pending' ? (
                    <Button label="Hủy đơn" variant="ghost" onPress={() => handleCancel(order.id)} />
                  ) : null}
                </Stack>
              </Stack>
            </Stack>
          </Card>
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  orderTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600',
    flexShrink: 1
  },
  status: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    fontSize: typography.small,
    color: colors.text,
    flexShrink: 1
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
  metaText: {
    color: colors.textMuted
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemName: {
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm
  },
  itemPrice: {
    color: colors.text
  },
  total: {
    color: colors.accent,
    fontSize: typography.subtitle,
    fontWeight: '700'
  }
});

export default OrdersScreen;
