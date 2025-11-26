import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useOrders } from '../../hooks/useOrders';
import { statusLabels } from '../../constants/statusLabels';

const statuses = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Hủy' }
];

const AdminOrdersScreen = () => {
  const navigation = useNavigation();
  const { orders, drones, updateOrderStatus, assignDrone, addOrderNote } = useOrders();

  return (
    <Screen>
      <AppHeader title="Quản lý đơn hàng" subtitle="Theo dõi trạng thái và điều phối drone." />

      {orders.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <View style={styles.header}>
            <Text style={styles.orderTitle}>Đơn {order.code ?? order.id}</Text>
            <Text style={styles.customer}>{order.customerName}</Text>
          </View>
          <Text style={styles.metaText}>Tổng: {Number(order.total ?? 0).toLocaleString('vi-VN')} đ</Text>
          <Text style={styles.metaText}>Drone: {order.droneId ?? 'Chưa gán'}</Text>
          <Text style={styles.metaText}>Trạng thái: {statusLabels[order.status] ?? order.status}</Text>
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
          <View style={styles.assignmentRow}>
            <TextInput
              style={styles.input}
              placeholder="Ghi chú"
              placeholderTextColor={colors.textMuted}
              value={order.note ?? ''}
              onChangeText={(value) => addOrderNote(order.id, value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Drone ID"
              placeholderTextColor={colors.textMuted}
              value={order.droneId ?? ''}
              onChangeText={(value) => assignDrone(order.id, value)}
            />
          </View>
          <View style={styles.dronesRow}>
            <Text style={styles.metaText}>Drone gợi ý:</Text>
            <View style={styles.chipRow}>
              {drones.map((drone) => (
                <Chip
                  key={drone.id}
                  label={`${drone.code ?? drone.id} (${drone.battery}%)`}
                  active={order.droneId === drone.id}
                  onPress={() => assignDrone(order.id, drone.id)}
                />
              ))}
            </View>
          </View>
          <Button
            label="Xem chi tiết"
            variant="ghost"
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
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
    gap: spacing.xs
  },
  orderTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600',
    flexShrink: 1
  },
  customer: {
    color: colors.textMuted,
    flexShrink: 1
  },
  metaText: {
    color: colors.textMuted,
    flexWrap: 'wrap'
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  assignmentRow: {
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
  },
  dronesRow: {
    gap: spacing.sm
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  }
});

export default AdminOrdersScreen;
