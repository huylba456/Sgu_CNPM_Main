import { StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useRestaurants } from '../../hooks/useRestaurants';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const RestaurantOrdersScreen = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, addOrderNote } = useOrders();
  const { restaurants } = useRestaurants();
  const restaurantId =
    user?.restaurantId ?? restaurants.find((item) => item.name === user?.restaurantName)?.id ?? '';
  const restaurantOrders = orders.filter((order) => order.restaurantId === restaurantId);

  return (
    <Screen>
      <AppHeader title="Đơn hàng nhà hàng" subtitle="Cập nhật trạng thái và ghi chú cho đơn hàng." />

      {restaurantId === '' ? (
        <Card style={styles.orderCard}>
          <Text style={styles.orderTitle}>Chưa gán nhà hàng</Text>
          <Text style={styles.customer}>
            Vui lòng liên hệ quản trị viên để được gán nhà hàng trước khi quản lý đơn.
          </Text>
        </Card>
      ) : null}

      {restaurantOrders.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <View style={styles.header}>
            <Text style={styles.orderTitle}>Đơn {order.id}</Text>
            <Text style={styles.customer}>{order.customerName}</Text>
          </View>
          <Text style={styles.metaText}>Tổng: {order.total.toLocaleString('vi-VN')} đ</Text>
          <View style={styles.statusRow}>
            {statuses.map((status) => (
              <Chip
                key={status.value}
                label={status.label}
                active={order.status === status.value}
                onPress={() => updateOrderStatus(order.id, status.value)}
              />
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ghi chú cho drone hoặc khách hàng"
            placeholderTextColor={colors.textMuted}
            value={order.note ?? ''}
            onChangeText={(value) => addOrderNote(order.id, value)}
          />
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    gap: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  customer: {
    color: colors.textMuted
  },
  metaText: {
    color: colors.textMuted
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface
  }
});

export default RestaurantOrdersScreen;
