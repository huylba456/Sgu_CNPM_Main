import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Button from '../components/Button';
import Stack from '../components/Stack';
import { colors, radius, spacing, typography } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const LoginScreen = ({ navigation }) => {
  const { login, register, logout } = useAuth();
  const { clearCart } = useCart();
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: 'customer@foodfast.io',
    password: '123456'
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const handleSubmit = () => {
    setMessage('');
    if (mode === 'login') {
      const result = login(loginForm.email.trim(), loginForm.password);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      navigation.goBack();
      return;
    }

    if (!registerForm.name.trim()) {
      setMessage('Vui lòng nhập họ tên');
      return;
    }
    if (registerForm.password.length < 6) {
      setMessage('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    const payload = {
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      phone: registerForm.phone.trim(),
      address: registerForm.address.trim()
    };
    const result = register(payload);
    if (!result.success) {
      setMessage(result.message ?? 'Không thể đăng ký tài khoản');
      return;
    }
    navigation.goBack();
  };

  const handleContinueAsGuest = () => {
    clearCart();
    logout();
    Alert.alert('Tiếp tục như khách', 'Bạn có thể duyệt thực đơn, hãy đăng nhập để đặt món.');
    navigation.goBack();
  };

  return (
    <Screen>
      <AppHeader
        title={mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản FoodFast'}
        subtitle={
          mode === 'login'
            ? 'Đăng nhập bằng tài khoản mẫu hoặc của bạn để tiếp tục đặt món.'
            : 'Hoàn tất biểu mẫu bên dưới để tạo tài khoản khách hàng mới.'
        }
      />

      <Stack direction="row" gap={spacing.md}>
        <Button
          label="Đăng nhập"
          variant={mode === 'login' ? 'primary' : 'secondary'}
          onPress={() => {
            setMode('login');
            setMessage('');
          }}
          style={styles.switchButton}
        />
        <Button
          label="Đăng ký"
          variant={mode === 'register' ? 'primary' : 'secondary'}
          onPress={() => {
            setMode('register');
            setMessage('');
          }}
          style={styles.switchButton}
        />
      </Stack>

      {message ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{message}</Text>
        </View>
      ) : null}

      {mode === 'login' ? (
        <Stack gap={spacing.sm}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={loginForm.email}
            onChangeText={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
          />
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={loginForm.password}
            onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
          />
          <Button label="Đăng nhập" onPress={handleSubmit} style={styles.submit} />
          <View style={styles.hintBox}>
            <Text style={styles.hint}>Customer: customer@foodfast.io / 123456</Text>
            <Text style={styles.hint}>Admin: admin@foodfast.io / admin</Text>
            <Text style={styles.hint}>Nhà hàng: restaurant@foodfast.io / restaurant</Text>
            <Text style={styles.hint}>Nhà hàng 2: sushi@foodfast.io / sushi</Text>
          </View>
        </Stack>
      ) : (
        <Stack gap={spacing.sm}>
          <Text style={styles.label}>Họ tên</Text>
          <TextInput
            style={styles.input}
            value={registerForm.name}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, name: value }))}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={registerForm.email}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, email: value }))}
          />
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={registerForm.phone}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, phone: value }))}
          />
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={registerForm.address}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, address: value }))}
          />
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={registerForm.password}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, password: value }))}
          />
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={registerForm.confirmPassword}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, confirmPassword: value }))}
          />
          <Button label="Tạo tài khoản" onPress={handleSubmit} style={styles.submit} />
        </Stack>
      )}

      <Button label="Tiếp tục như khách" variant="ghost" onPress={handleContinueAsGuest} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  switchButton: {
    flex: 1
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface
  },
  submit: {
    marginTop: spacing.md
  },
  hintBox: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  alert: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderWidth: 1,
    borderColor: colors.danger
  },
  alertText: {
    color: colors.danger,
    fontSize: typography.small
  }
});

export default LoginScreen;
