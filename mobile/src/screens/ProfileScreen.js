import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { colors, spacing, typography } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { statusLabels } from '../constants/statusLabels';
import { useRestaurants } from '../hooks/useRestaurants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, users, updateUser } = useAuth();
  const { orders, getStats, drones } = useOrders();
  const { restaurants } = useRestaurants();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [status, setStatus] = useState('');

  const sortedOrders = useMemo(
    () =>
      orders
        .slice()
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [orders]
  );

  const restaurantOrders = useMemo(() => {
    if (!user?.restaurantId) {
      return [];
    }

    return sortedOrders.filter((order) => order.restaurantId === user.restaurantId);
  }, [sortedOrders, user?.restaurantId]);

  const customerOrders = useMemo(() => {
    if (!user?.email) {
      return [];
    }

    return sortedOrders.filter((order) => order.customerEmail === user.email);
  }, [sortedOrders, user?.email]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? ''
    });
  }, [user]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;
    const updates = {
      name: form.name.trim() || user.name,
      phone: form.phone.trim(),
      address: form.address.trim()
    };
    updateUser(user.id, updates);
    setStatus('Đã lưu thay đổi của bạn.');
  };

  if (!user) {
    return (
      <Screen>
        <AppHeader title="Hồ sơ" subtitle="Đăng nhập để xem thông tin khách hàng." />
        <EmptyState
          title="Chưa đăng nhập"
          description="Đăng nhập để quản lý thông tin cá nhân và lịch sử đơn hàng."
        />
        <Button label="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </Screen>
    );
  }

  if (user.role === 'admin') {
    const systemStats = getStats();
    const customerCount = users.filter((item) => item.role === 'customer').length;
    const restaurantCount = users.filter((item) => item.role === 'restaurant').length;
    const adminCount = users.filter((item) => item.role === 'admin').length;
    const recentOrders = sortedOrders.slice(0, 4);
    const droneCount = drones.length;

    return (
      <Screen>
        <AppHeader
          title="Hồ sơ quản trị"
          subtitle="Thông tin quản trị viên và tổng quan hệ thống FoodFast."
        />

        <View style={styles.grid}>
          <Card style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Thông tin quản trị</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Họ và tên</Text>
              <Text style={styles.value}>{user.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Số điện thoại</Text>
              <Text style={styles.value}>{user.phone || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>{user.address || 'Chưa cập nhật'}</Text>
            </View>
            <Button label="Đăng xuất" variant="ghost" onPress={logout} />
          </Card>

          <Card style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tổng đơn</Text>
              <Text style={styles.value}>{systemStats.total}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đơn đã giao</Text>
              <Text style={styles.value}>{systemStats.delivered}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đơn đang giao</Text>
              <Text style={styles.value}>{systemStats.shipping}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Khách hàng</Text>
              <Text style={styles.value}>{customerCount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nhà hàng</Text>
              <Text style={styles.value}>{restaurantCount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Quản trị viên</Text>
              <Text style={styles.value}>{adminCount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đội drone</Text>
              <Text style={styles.value}>{droneCount}</Text>
            </View>
          </Card>
        </View>

        <Card style={styles.orderHistory}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyHistory}>Chưa có đơn hàng nào được tạo.</Text>
          ) : (
            recentOrders.map((order) => {
              const restaurantName =
                restaurants.find((item) => item.id === order.restaurantId)?.name ?? order.restaurantId;

              return (
                <View key={order.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>Đơn {order.code ?? order.id}</Text>
                    <Text style={[styles.status, styles[`status_${order.status}`]]}>
                      {statusLabels[order.status] ?? order.status}
                    </Text>
                  </View>
                  <Text style={styles.metaText}>
                    Khách hàng: {order.customerName} • Tổng: {order.total.toLocaleString('vi-VN')} đ
                  </Text>
                  <Text style={styles.metaText}>
                    Drone: {order.droneId ?? 'Chưa gán'} • Nhà hàng: {restaurantName}
                  </Text>
                </View>
              );
            })
          )}
        </Card>
      </Screen>
    );
  }

  if (user.role === 'restaurant') {
    const restaurant =
      restaurants.find((item) => item.id === user.restaurantId) ?? restaurants[0];
    const restaurantStats = getStats(restaurantOrders);
    const revenue = restaurantOrders.reduce((sum, order) => sum + order.total, 0);
    const inProgress = restaurantOrders.filter((order) =>
      ['pending', 'preparing', 'shipping'].includes(order.status)
    ).length;

    return (
      <Screen>
        <AppHeader
          title="Hồ sơ nhà hàng"
          subtitle={`${restaurant.name} • Drone pad: ${restaurant.dronePad}`}
        />

        <View style={styles.grid}>
          <Card style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Chủ tài khoản</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Họ và tên</Text>
              <Text style={styles.value}>{user.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Số điện thoại</Text>
              <Text style={styles.value}>{user.phone || 'Chưa cập nhật'}</Text>
            </View>
            <Button label="Đăng xuất" variant="ghost" onPress={logout} />
          </Card>

          <Card style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Thông tin nhà hàng</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tên nhà hàng</Text>
              <Text style={styles.value}>{restaurant.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>{restaurant.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Liên hệ</Text>
              <Text style={styles.value}>{restaurant.contact}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tổng đơn</Text>
              <Text style={styles.value}>{restaurantStats.total}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đang xử lý</Text>
              <Text style={styles.value}>{inProgress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đã giao</Text>
              <Text style={styles.value}>{restaurantStats.delivered}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Doanh thu</Text>
              <Text style={styles.value}>{revenue.toLocaleString('vi-VN')} đ</Text>
            </View>
          </Card>
        </View>

        <Card style={styles.orderHistory}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          {restaurantOrders.length === 0 ? (
            <Text style={styles.emptyHistory}>Nhà hàng chưa có đơn hàng nào.</Text>
          ) : (
            restaurantOrders.map((order) => (
              <View key={order.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Đơn {order.code ?? order.id}</Text>
                  <Text style={[styles.status, styles[`status_${order.status}`]]}>
                    {statusLabels[order.status] ?? order.status}
                  </Text>
                </View>
                <Text style={styles.metaText}>Khách hàng: {order.customerName}</Text>
                <Text style={styles.metaText}>
                  Tổng tiền: {order.total.toLocaleString('vi-VN')} đ • Drone: {order.droneId ?? 'Chưa gán'}
                </Text>
              </View>
            ))
          )}
        </Card>
      </Screen>
    );
  }

  const totalPaid = customerOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);
  const deliveredCount = customerOrders.filter((order) => order.status === 'delivered').length;

  return (
    <Screen>
      <AppHeader title="Hồ sơ khách hàng" subtitle="Quản lý thông tin và lịch sử thanh toán của bạn." />

      <View style={styles.grid}>
        <Card style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Nhập họ tên"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={[styles.value, styles.readonly]}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(text) => handleChange('address', text)}
              placeholder="Nhập địa chỉ giao hàng"
            />
          </View>
          {status ? <Text style={styles.statusText}>{status}</Text> : null}
          <View style={styles.actions}>
            <Button label="Lưu thay đổi" onPress={handleSave} />
            <Button label="Đăng xuất" variant="ghost" onPress={logout} />
          </View>
        </Card>

        <Card style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tổng tiền đã thanh toán</Text>
            <Text style={styles.value}>{totalPaid.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Đơn hàng đã giao</Text>
            <Text style={styles.value}>{deliveredCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tổng số đơn hàng</Text>
            <Text style={styles.value}>{customerOrders.length}</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md
  },
  profileCard: {
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
    gap: spacing.sm,
    alignItems: 'center'
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
  readonly: {
    color: colors.textMuted
  },
  input: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    backgroundColor: colors.surface
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  statusText: {
    color: colors.success,
    fontSize: typography.small
  },
  orderHistory: {
    gap: spacing.md
  },
  emptyHistory: {
    color: colors.textMuted
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
  historyTitle: {
    color: colors.text,
    fontWeight: '600'
  },
  historyFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyTotal: {
    color: colors.accent,
    fontWeight: '700'
  },
  metaText: {
    color: colors.textMuted
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
  }
});

export default ProfileScreen;
