import { Alert, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { colors, spacing, typography } from '../styles/theme';
import { useOrders } from '../hooks/useOrders';
import { statusLabels } from '../constants/statusLabels';
import { useAuth } from '../hooks/useAuth';
import { useRestaurants } from '../hooks/useRestaurants';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params ?? {};
  const { orders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const { restaurants } = useRestaurants();
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <Screen>
        <EmptyState title="Không tìm thấy đơn hàng" description="Đơn hàng đã bị xóa hoặc không tồn tại." />
        <Button label="Quay lại" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const restaurant = restaurants.find((item) => item.id === order.restaurantId);
  const routeInfo = {
    restaurant: restaurant?.name ?? 'Đang cập nhật',
    customer: order.customerName ?? 'Khách hàng',
    points: [
      { lat: 90, lng: 10 },
      { lat: 70, lng: 30 },
      { lat: 55, lng: 45 },
      { lat: 35, lng: 65 },
      { lat: 20, lng: 80 }
    ]
  };
  const canCancel = user?.role === 'customer' && order.status === 'pending';
  const canAdvance = user && (user.role === 'admin' || user.role === 'restaurant');

  const handleCancel = () => {
    Alert.alert('Hủy đơn hàng', `Bạn có chắc chắn muốn hủy đơn ${order.code ?? order.id}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: () => updateOrderStatus(order.id, 'cancelled')
      }
    ]);
  };

  const handleAdvance = () => {
    const nextStatus = order.status === 'pending'
      ? 'preparing'
      : order.status === 'preparing'
        ? 'shipping'
        : order.status === 'shipping'
          ? 'delivered'
          : order.status;

    if (nextStatus === order.status) {
      Alert.alert('Trạng thái', 'Đơn hàng đã hoàn tất.');
      return;
    }

    updateOrderStatus(order.id, nextStatus);
  };

  return (
    <Screen>
      <AppHeader title={`Đơn hàng ${order.code ?? order.id}`} subtitle={statusLabels[order.status] ?? order.status} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Khách hàng</Text>
          <Text style={styles.value}>{order.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{order.customerEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Địa chỉ giao</Text>
          <Text style={styles.value}>{order.deliveryAddress ?? order.customerAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nhà hàng chuẩn bị</Text>
          <Text style={styles.value}>{restaurant?.name ?? 'Đang cập nhật'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Drone phụ trách</Text>
          <Text style={styles.value}>{order.droneId ?? 'Đang phân bổ'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phương thức thanh toán</Text>
          <Text style={styles.value}>{order.paymentMethod ?? 'Đang cập nhật'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời gian đặt</Text>
          <Text style={styles.value}>{new Date(order.placedAt).toLocaleString('vi-VN')}</Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết món ăn</Text>
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
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{order.total.toLocaleString('vi-VN')} đ</Text>
        </View>
      </Card>

      {routeInfo ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Lộ trình bay dự kiến</Text>
          <Text style={styles.routeText}>Từ: {routeInfo.restaurant}</Text>
          <Text style={styles.routeText}>Đến: {routeInfo.customer}</Text>
          <Text style={styles.routeText}>Điểm trung gian:</Text>
          {routeInfo.points.map((point, index) => (
            <Text key={`${point.lat}-${point.lng}`} style={styles.routePoint}>
              • Vĩ độ {point.lat}, Kinh độ {point.lng}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label="Trở lại" variant="ghost" onPress={() => navigation.goBack()} />
        {canCancel ? <Button label="Hủy đơn" variant="ghost" onPress={handleCancel} /> : null}
        {canAdvance ? <Button label="Cập nhật trạng thái" onPress={handleAdvance} /> : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  label: {
    color: colors.textMuted,
    flex: 1
  },
  value: {
    color: colors.text,
    flex: 1,
    textAlign: 'right'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: {
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm
  },
  itemPrice: {
    color: colors.text
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  totalValue: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700'
  },
  routeText: {
    color: colors.textMuted
  },
  routePoint: {
    color: colors.text,
    marginLeft: spacing.md
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md
  }
});

export default OrderDetailScreen;
