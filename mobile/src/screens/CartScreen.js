import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../styles/theme';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) {
    return (
      <Screen>
        <AppHeader title="Giỏ hàng" subtitle="Đăng nhập để tiếp tục đặt món." />
        <EmptyState
          title="Bạn cần đăng nhập"
          description="Giỏ hàng chỉ khả dụng khi bạn đăng nhập."
        />
        <Button label="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Giỏ hàng của bạn" subtitle="Kiểm tra lại món ăn trước khi thanh toán." />

      {cartItems.length === 0 ? (
        <EmptyState title="Giỏ hàng trống" description="Hãy thêm món để bắt đầu đơn hàng đầu tiên." />
      ) : (
        <>
          {cartItems.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
                </View>
                <Button label="Xóa" variant="ghost" onPress={() => removeFromCart(item.id)} />
              </View>
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Số lượng</Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          <Card style={styles.summary}>
            <Text style={styles.summaryTitle}>Tổng thanh toán</Text>
            <Text style={styles.summaryValue}>{total.toLocaleString('vi-VN')} đ</Text>
            <Button label="Tiến hành thanh toán" onPress={() => navigation.navigate('Checkout')} />
          </Card>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    gap: spacing.md
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemInfo: {
    gap: spacing.xs,
    flex: 1
  },
  itemName: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  itemPrice: {
    color: colors.textMuted
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quantityLabel: {
    color: colors.textMuted
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperText: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  quantityValue: {
    color: colors.text,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center'
  },
  summary: {
    gap: spacing.sm
  },
  summaryTitle: {
    color: colors.textMuted
  },
  summaryValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700'
  }
});

export default CartScreen;
