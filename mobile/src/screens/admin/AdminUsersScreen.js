import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';

const roles = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'admin', label: 'Quản trị' }
];

const generateId = () => `u-${Math.random().toString(36).slice(2, 8)}`;

const AdminUsersScreen = () => {
  const { users, setUserList } = useAuth();
  const [activeRole, setActiveRole] = useState('all');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);

  const filtered = users.filter((user) => activeRole === 'all' || user.role === activeRole);

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'customer', phone: '', address: '' });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và email.');
      return;
    }

    const payload = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      phone: form.phone.trim(),
      address: form.address.trim()
    };

    if (editingId) {
      setUserList((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...payload, password: item.password } : item
        )
      );
    } else {
      setUserList((prev) => [...prev, { ...payload, password: '123456' }]);
    }

    resetForm();
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? '',
      address: user.address ?? ''
    });
    setEditingId(user.id);
  };

  const handleDelete = (user) => {
    Alert.alert('Xóa tài khoản', `Bạn có chắc chắn muốn xóa ${user.name}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setUserList((prev) => prev.filter((item) => item.id !== user.id));
          if (editingId === user.id) {
            resetForm();
          }
        }
      }
    ]);
  };

  return (
    <Screen>
      <AppHeader title="Quản lý tài khoản" subtitle="Quản trị danh sách người dùng và phân quyền." />

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Thêm tài khoản nhanh</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor={colors.textMuted}
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
        />
        <View style={styles.categoryRow}>
          {roles.map((role) => (
            <Chip
              key={role.value}
              label={role.label}
              active={form.role === role.value}
              onPress={() => setForm((prev) => ({ ...prev, role: role.value }))}
            />
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          placeholderTextColor={colors.textMuted}
          value={form.address}
          onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
        />
        <Button label={editingId ? 'Lưu thay đổi' : 'Thêm tài khoản'} onPress={handleSubmit} />
        {editingId ? <Button label="Hủy" variant="ghost" onPress={resetForm} /> : null}
      </Card>

      <Card style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Danh sách người dùng</Text>
        <View style={styles.categoryRow}>
          <Chip label="Tất cả" active={activeRole === 'all'} onPress={() => setActiveRole('all')} />
          {roles.map((role) => (
            <Chip
              key={role.value}
              label={role.label}
              active={activeRole === role.value}
              onPress={() => setActiveRole(role.value)}
            />
          ))}
        </View>
        {filtered.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userMeta}>{user.email}</Text>
              <Text style={styles.userMeta}>{roles.find((role) => role.value === user.role)?.label}</Text>
            </View>
            <View style={styles.actions}>
              <Button label="Sửa" variant="ghost" onPress={() => handleEdit(user)} />
              <Button label="Xóa" variant="ghost" onPress={() => handleDelete(user)} />
            </View>
          </View>
        ))}
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  filterCard: {
    gap: spacing.md
  },
  userRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  userInfo: {
    gap: spacing.xs
  },
  userName: {
    color: colors.text,
    fontWeight: '600'
  },
  userMeta: {
    color: colors.textMuted
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm
  }
});

export default AdminUsersScreen;
