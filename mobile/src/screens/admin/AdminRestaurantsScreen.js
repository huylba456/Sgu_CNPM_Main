import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../styles/theme';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useOrders } from '../../hooks/useOrders';
import { useNavigation } from '@react-navigation/native';

const AdminRestaurantsScreen = () => {
  const navigation = useNavigation();
  const { restaurants } = useRestaurants();
  const { orders } = useOrders();

  const restaurantStats = useMemo(
    () =>
      restaurants.map((restaurant) => {
        const relatedOrders = orders.filter(
          (order) => order.restaurantId === restaurant.id || order.restaurant === restaurant.name
        );
        const revenue = relatedOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
        return {
          ...restaurant,
          revenue,
          orderCount: relatedOrders.length
        };
      }),
    [orders, restaurants]
  );

  return (
    <Screen>
      <AppHeader
        title="Nhà hàng"
        subtitle="Danh sách nhà hàng và doanh thu tổng quan."
      />

      <Card style={styles.helperCard}>
        <Text style={styles.helperText}>Chọn một nhà hàng để xem doanh thu chi tiết.</Text>
      </Card>

      <View style={styles.list}>
        {restaurantStats.map((restaurant) => (
          <Card key={restaurant.id} style={styles.restaurantCard}>
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{restaurant.name}</Text>
                <Text style={styles.muted}>{restaurant.address || 'Chưa có địa chỉ'}</Text>
              </View>
              <Button
                label="Chi tiết"
                variant="ghost"
                onPress={() => navigation.navigate('AdminRestaurantDetail', { id: restaurant.id })}
              />
            </View>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.muted}>Doanh thu</Text>
                <Text style={styles.value}>{restaurant.revenue.toLocaleString('vi-VN')} đ</Text>
              </View>
              <View>
                <Text style={styles.muted}>Đơn hàng</Text>
                <Text style={styles.value}>{restaurant.orderCount}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm
  },
  restaurantCard: {
    gap: spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm
  },
  name: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '700'
  },
  muted: {
    color: colors.textMuted
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  value: {
    color: colors.text,
    fontWeight: '700'
  },
  helperCard: {
    marginBottom: spacing.md
  },
  helperText: {
    color: colors.text
  },
  backLink: {
    marginTop: spacing.md,
    alignItems: 'center'
  },
  backText: {
    color: colors.primary,
    fontWeight: '600'
  }
});

export default AdminRestaurantsScreen;
