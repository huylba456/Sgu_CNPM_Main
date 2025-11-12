import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatHighlight from '../../components/StatHighlight';
import { colors, spacing, typography } from '../../styles/theme';
import { useOrders } from '../../hooks/useOrders';
import { products } from '../../data/mockProducts';
import { users } from '../../data/mockUsers';
import { drones } from '../../data/mockDrones';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const latestOrders = orders.slice(0, 3);
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <Screen>
      <AppHeader title="Dashboard tổng quan" subtitle="Theo dõi hiệu suất đội drone và đơn hàng trong ngày." />

      <View style={styles.statRow}>
        <StatHighlight label="Tổng đơn" value={stats.total} />
        <StatHighlight label="Đã giao" value={stats.delivered} tone="success" />
        <StatHighlight label="Đang giao" value={stats.shipping} tone="accent" />
      </View>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Tác vụ nhanh</Text>
        <View style={styles.actionGrid}>
          <Button
            label="Quản lý món"
            variant="ghost"
            onPress={() => navigation.navigate('AdminProducts')}
          />
          <Button
            label="Quản lý đơn"
            variant="ghost"
            onPress={() => navigation.navigate('AdminOrders')}
          />
          <Button
            label="Quản lý tài khoản"
            variant="ghost"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <Button
            label="Đội drone"
            variant="ghost"
            onPress={() => navigation.navigate('AdminDrones')}
          />
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Đơn hàng gần nhất</Text>
        <View style={styles.orderList}>
          {latestOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderCustomer}>{order.customerName}</Text>
              <Text style={styles.orderStatus}>{order.status}</Text>
              <Text style={styles.orderTotal}>{order.total.toLocaleString('vi-VN')} đ</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Món ăn được yêu thích</Text>
        {topProducts.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productRestaurant}>{product.restaurant}</Text>
            </View>
            <Text style={styles.productRating}>{product.rating.toFixed(1)}/5</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Đội drone</Text>
        {drones.map((drone) => (
          <View key={drone.id} style={styles.productRow}>
            <View>
              <Text style={styles.productName}>{drone.id}</Text>
              <Text style={styles.productRestaurant}>Tình trạng: {drone.status}</Text>
            </View>
            <Text style={styles.productRating}>{drone.battery}% pin</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Tài khoản hệ thống</Text>
        <Text style={styles.metaText}>Khách hàng: {users.filter((user) => user.role === 'customer').length}</Text>
        <Text style={styles.metaText}>Nhà hàng: {users.filter((user) => user.role === 'restaurant').length}</Text>
        <Text style={styles.metaText}>Quản trị viên: {users.filter((user) => user.role === 'admin').length}</Text>
      </Card>
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
  orderList: {
    gap: spacing.sm
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  orderId: {
    color: colors.text,
    fontWeight: '600'
  },
  orderCustomer: {
    color: colors.textMuted,
    flex: 1,
    marginLeft: spacing.sm
  },
  orderStatus: {
    color: colors.textMuted
  },
  orderTotal: {
    color: colors.accent,
    fontWeight: '600'
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productName: {
    color: colors.text,
    fontWeight: '600'
  },
  productRestaurant: {
    color: colors.textMuted
  },
  productRating: {
    color: colors.accent,
    fontWeight: '700'
  },
  metaText: {
    color: colors.textMuted
  }
});

export default AdminDashboardScreen;
