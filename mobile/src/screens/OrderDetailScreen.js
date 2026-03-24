import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
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

const defaultPosition = { lat: 10.776889, lng: 106.700806 };

const coordinatesByAddress = {
  'Vinhomes Grand Park': { lat: 10.843018, lng: 106.828537 },
  'Landmark 81': { lat: 10.794167, lng: 106.722222 },
  'Thủ Thiêm Eco': { lat: 10.781135, lng: 106.730743 },
  'Sala Đại Quang Minh': { lat: 10.780379, lng: 106.716589 },
  'Thảo Điền, TP. Thủ Đức': { lat: 10.802101, lng: 106.737743 },
  'Quận 1, TP. HCM': { lat: 10.776889, lng: 106.700806 }
};

const normalizePosition = (position) => {
  if (position?.lat && position?.lng) return position;
  return defaultPosition;
};

const buildStaticMapUrl = (start, end) => {
  const safeStart = normalizePosition(start);
  const safeEnd = normalizePosition(end);
  const center = {
    lat: (safeStart.lat + safeEnd.lat) / 2,
    lng: (safeStart.lng + safeEnd.lng) / 2
  };

  const params = new URLSearchParams({
    center: `${center.lat},${center.lng}`,
    zoom: '13',
    size: '640x360',
    scale: '2'
  });

  params.append('markers', `${safeStart.lat},${safeStart.lng},lightblue1|${safeEnd.lat},${safeEnd.lng},red`);
  params.append('path', `weight:4|color:0x2563ebff|${safeStart.lat},${safeStart.lng}|${safeEnd.lat},${safeEnd.lng}`);

  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
};

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params ?? {};
  const { orders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const { restaurants } = useRestaurants();
  const order = orders.find((item) => item.id === orderId);
  const [remainingSeconds, setRemainingSeconds] = useState(20);
  const [canConfirmDelivery, setCanConfirmDelivery] = useState(false);

  if (!order) {
    return (
      <Screen>
        <EmptyState title="Không tìm thấy đơn hàng" description="Đơn hàng đã bị xóa hoặc không tồn tại." />
        <Button label="Quay lại" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const restaurant = restaurants.find((item) => item.id === order.restaurantId);
  const restaurantPosition = useMemo(
    () => coordinatesByAddress[restaurant?.address] ?? defaultPosition,
    [restaurant?.address]
  );
  const deliveryPosition = useMemo(() => {
    const address = order.deliveryAddress ?? order.customerAddress;
    return normalizePosition(order.deliveryCoordinates ?? coordinatesByAddress[address]);
  }, [order.customerAddress, order.deliveryAddress, order.deliveryCoordinates]);
  const routeMapUrl = useMemo(
    () => buildStaticMapUrl(restaurantPosition, deliveryPosition),
    [deliveryPosition, restaurantPosition]
  );

  const canCancel = user?.role === 'customer' && order.status === 'pending';
  const canAdvance =
    user && (user.role === 'admin' || user.role === 'restaurant') && ['pending', 'preparing'].includes(order.status);

  useEffect(() => {
    if (user?.role !== 'customer' || order.status !== 'shipping') {
      setRemainingSeconds(20);
      setCanConfirmDelivery(false);
      return undefined;
    }

    setRemainingSeconds(20);
    setCanConfirmDelivery(false);
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanConfirmDelivery(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order.status, user?.role]);

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
        : order.status;

    if (nextStatus === order.status) {
      Alert.alert('Trạng thái', 'Chỉ có thể chuyển tiếp đến trạng thái tiếp theo.');
      return;
    }

    updateOrderStatus(order.id, nextStatus);
  };

  const handleConfirmDelivery = () => {
    updateOrderStatus(order.id, 'delivered');
    setCanConfirmDelivery(false);
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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Lộ trình bay dự kiến</Text>
        <Text style={styles.routeText}>
          Drone rời {restaurant?.name ?? 'nhà hàng'} để tới {order.deliveryAddress ?? order.customerAddress ?? 'điểm giao hàng'}.
        </Text>
        <View style={styles.mapContainer}>
          <Image source={{ uri: routeMapUrl }} style={styles.mapImage} />
        </View>
        <View style={styles.routeLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendLabel}>Điểm xuất phát</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendLabel}>Điểm giao hàng</Text>
          </View>
        </View>
      </Card>

      {user?.role === 'customer' && order.status === 'shipping' ? (
        <Card style={styles.section}>
          {canConfirmDelivery ? (
            <View style={styles.arrivalRow}>
              <Text style={styles.sectionTitle}>Drone đã đến nơi</Text>
              <Button label="Đã nhận hàng" onPress={handleConfirmDelivery} />
            </View>
          ) : (
            <Text style={styles.countdownText}>Drone sẽ tới trong khoảng {remainingSeconds}s</Text>
          )}
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
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  mapImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surfaceAlt
  },
  routeLegend: {
    flexDirection: 'row',
    gap: spacing.md
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendLabel: {
    color: colors.text
  },
  arrivalRow: {
    gap: spacing.sm
  },
  countdownText: {
    color: colors.accent
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md
  }
});

export default OrderDetailScreen;
