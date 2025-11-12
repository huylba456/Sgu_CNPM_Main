import { StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

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
  const restaurantOrders = orders.filter((order) => order.restaurantId === (user?.restaurantId ?? 'r1'));

  return (
    <Screen>
      <AppHeader title="Đơn hàng nhà hàng" subtitle="Cập nhật trạng thái và ghi chú cho đơn hàng." />

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
