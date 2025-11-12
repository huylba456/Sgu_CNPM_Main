import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Chip from '../components/Chip';
import { colors, spacing, typography } from '../styles/theme';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const paymentMethods = ['Ví FoodFast Pay', 'Thẻ tín dụng', 'Chuyển khoản'];

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [recipient, setRecipient] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  if (!user) {
    return (
      <Screen>
        <AppHeader title="Thanh toán" subtitle="Đăng nhập để tiếp tục đặt món." />
        <EmptyState
          title="Bạn cần đăng nhập"
          description="Vui lòng đăng nhập để hoàn tất thông tin thanh toán."
        />
        <Button label="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </Screen>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Screen>
        <AppHeader title="Thanh toán" subtitle="Giỏ hàng của bạn đang trống." />
        <EmptyState
          title="Không có món trong giỏ"
          description="Hãy quay lại danh mục để thêm món yêu thích."
        />
        <Button label="Xem thực đơn" onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })} />
      </Screen>
    );
  }

  const handleSubmit = () => {
    if (!recipient.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      'Drone sẽ cất cánh ngay sau khi bạn xác nhận thanh toán.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            clearCart();
            Alert.alert('Đặt hàng thành công', 'Đơn hàng đã được tạo, bạn có thể theo dõi trong mục Đơn hàng.');
            navigation.navigate('MainTabs', { screen: 'Orders' });
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <AppHeader title="Thanh toán" subtitle="Hoàn tất thông tin để drone chuẩn bị cất cánh." />

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tên người nhận</Text>
          <TextInput style={styles.input} value={recipient} onChangeText={setRecipient} />
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Địa chỉ drone hạ cánh</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ghi chú cho nhà hàng</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phương thức thanh toán</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {paymentMethods.map((method) => (
              <Chip
                key={method}
                label={method}
                active={paymentMethod === method}
                onPress={() => setPaymentMethod(method)}
              />
            ))}
          </ScrollView>
        </View>
      </Card>

      <Card style={styles.summary}>
        <Text style={styles.sectionTitle}>Tổng kết đơn hàng</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryName}>
              {item.name} x{item.quantity}
            </Text>
            <Text style={styles.summaryValue}>
              {(item.price * item.quantity).toLocaleString('vi-VN')} đ
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.summaryTotal}>{total.toLocaleString('vi-VN')} đ</Text>
        </View>
        <Button label="Xác nhận thanh toán" onPress={handleSubmit} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs
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
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top'
  },
  fieldGroup: {
    gap: spacing.xs
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md
  },
  fieldHalf: {
    flex: 1,
    gap: spacing.xs
  },
  chipRow: {
    flexGrow: 0
  },
  summary: {
    gap: spacing.sm
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryName: {
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm
  },
  summaryValue: {
    color: colors.text
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm
  },
  summaryTotalLabel: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  summaryTotal: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700'
  }
});

export default CheckoutScreen;
