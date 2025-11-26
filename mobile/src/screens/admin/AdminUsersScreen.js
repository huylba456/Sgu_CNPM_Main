import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRestaurants } from '../../hooks/useRestaurants';

const roles = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'admin', label: 'Quản trị' }
];

const generateId = () => `u-${Math.random().toString(36).slice(2, 8)}`;
const defaultRestaurantImage = 'foodfast-placeholder.svg';

const AdminUsersScreen = () => {
  const { users, setUserList } = useAuth();
  const { restaurants, addRestaurant } = useRestaurants();
  const [activeRole, setActiveRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: '',
    password: '',
    restaurantId: '',
    restaurantName: '',
    newRestaurantName: '',
    newRestaurantAddress: '',
    newRestaurantImage: ''
  });
  const [editingId, setEditingId] = useState(null);

  const filtered = users
    .filter((user) => activeRole === 'all' || user.role === activeRole)
    .filter((user) => {
      const keyword = searchTerm.toLowerCase();
      return (
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.phone ?? '').toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      if (sortKey === 'role') {
        return a.role.localeCompare(b.role) * direction;
      }
      if (sortKey === 'status') {
        return (a.status ?? 'active').localeCompare(b.status ?? 'active') * direction;
      }
      return 0;
    });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: 'customer',
      phone: '',
      address: '',
      password: '',
      restaurantId: '',
      restaurantName: '',
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và email.');
      return;
    }

    const currentUser = editingId ? users.find((item) => item.id === editingId) : null;
    const currentStatus = currentUser?.status ?? 'active';

    if (!editingId && !form.password.trim()) {
      Alert.alert('Thiếu mật khẩu', 'Vui lòng nhập mật khẩu cho tài khoản mới.');
      return;
    }

    if (form.role === 'restaurant' && !form.restaurantId && !form.newRestaurantName.trim()) {
      Alert.alert('Chọn nhà hàng', 'Vui lòng gán một nhà hàng cho tài khoản này.');
      return;
    }

    const payload = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      phone: form.phone.trim(),
      address: form.address.trim(),
      password: form.password.trim() || currentUser?.password || '123456',
      status: currentStatus,
      restaurantId: form.role === 'restaurant' ? form.restaurantId : '',
      restaurantName:
        form.role === 'restaurant'
          ? form.restaurantName || restaurants.find((item) => item.id === form.restaurantId)?.name || ''
          : ''
    };

    if (editingId) {
      setUserList((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
      );
    } else {
      let restaurantId = payload.restaurantId;
      let restaurantName = payload.restaurantName;

      if (payload.role === 'restaurant' && (restaurantId === 'new' || !restaurantId)) {
        const created = addRestaurant({
          name: form.newRestaurantName || form.restaurantName,
          address: form.newRestaurantAddress,
          image: form.newRestaurantImage || defaultRestaurantImage
        });
        restaurantId = created.id;
        restaurantName = created.name;
      }

      setUserList((prev) => [
        ...prev,
        {
          ...payload,
          restaurantId: payload.role === 'restaurant' ? restaurantId : '',
          restaurantName: payload.role === 'restaurant' ? restaurantName : ''
        }
      ]);
    }

    resetForm();
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? '',
      address: user.address ?? '',
      password: '',
      restaurantId: user.restaurantId ?? '',
      restaurantName: user.restaurantName ?? '',
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });
    setEditingId(user.id);
  };

  const toggleStatus = (user) => {
    setUserList((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, status: item.status === 'inactive' ? 'active' : 'inactive' } : item
      )
    );
    if (editingId === user.id) {
      setForm((prev) => ({ ...prev }));
    }
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
              onPress={() =>
                setForm((prev) => {
                  if (role.value !== 'restaurant') {
                    return {
                      ...prev,
                      role: role.value,
                      restaurantId: '',
                      restaurantName: '',
                      newRestaurantName: '',
                      newRestaurantAddress: ''
                    };
                  }
                  const firstRestaurant = restaurants[0];
                  const restaurantId = prev.restaurantId || firstRestaurant?.id || '';
                  const restaurantName =
                    prev.restaurantName ||
                    restaurants.find((item) => item.id === restaurantId)?.name ||
                    firstRestaurant?.name ||
                    '';

                  return {
                    ...prev,
                    role: role.value,
                    restaurantId,
                    restaurantName,
                    address: prev.address || firstRestaurant?.address || '',
                    newRestaurantImage: ''
                  };
                })
              }
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
          {form.role === 'restaurant' ? (
            <View style={styles.restaurantSection}>
              <Text style={styles.label}>Chọn nhà hàng</Text>
              <View style={styles.categoryRow}>
                {restaurants.map((restaurant) => (
                  <Chip
                    key={restaurant.id}
                    label={restaurant.name}
                    active={form.restaurantId === restaurant.id}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                      address: prev.address || restaurant.address,
                      newRestaurantName: '',
                      newRestaurantAddress: ''
                      }))
                    }
                  />
                ))}
                <Chip
                  label="+ Thêm nhà hàng mới"
                  active={form.restaurantId === 'new'}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      restaurantId: 'new',
                      restaurantName: '',
                      newRestaurantName: '',
                      newRestaurantAddress: ''
                    }))
                  }
                />
              </View>
              {form.restaurantId === 'new' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Tên nhà hàng mới"
                    placeholderTextColor={colors.textMuted}
                    value={form.newRestaurantName}
                    onChangeText={(value) => setForm((prev) => ({ ...prev, newRestaurantName: value }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ nhà hàng (tuỳ chọn)"
                    placeholderTextColor={colors.textMuted}
                    value={form.newRestaurantAddress}
                    onChangeText={(value) => setForm((prev) => ({ ...prev, newRestaurantAddress: value }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tải lên URL ảnh nhà hàng (trống sẽ dùng logo FoodFast)"
                    placeholderTextColor={colors.textMuted}
                    value={form.newRestaurantImage}
                    onChangeText={(value) => setForm((prev) => ({ ...prev, newRestaurantImage: value }))}
                  />
                </>
              ) : null}
            </View>
          ) : null}
        <TextInput
          style={styles.input}
          placeholder={editingId ? 'Mật khẩu (để trống nếu giữ nguyên)' : 'Mật khẩu'}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={form.password}
          onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
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
        <TextInput
          style={styles.input}
          placeholder="Tìm theo tên, email hoặc SĐT"
          placeholderTextColor={colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.sortRow}>
          <Text style={styles.label}>Sắp xếp theo:</Text>
          <View style={styles.categoryRow}>
            <Chip label="Tên" active={sortKey === 'name'} onPress={() => setSortKey('name')} />
            <Chip label="Vai trò" active={sortKey === 'role'} onPress={() => setSortKey('role')} />
            <Chip label="Trạng thái" active={sortKey === 'status'} onPress={() => setSortKey('status')} />
          </View>
          <Button
            label={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            variant="ghost"
            onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          />
        </View>
        {filtered.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userMeta}>{user.email}</Text>
              <Text style={styles.userMeta}>{roles.find((role) => role.value === user.role)?.label}</Text>
              <Text style={[styles.userMeta, user.status === 'inactive' ? styles.inactive : styles.active]}>
                {user.status === 'inactive' ? 'Đã khóa' : 'Đang hoạt động'}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                label={user.status === 'inactive' ? 'Mở khóa' : 'Khóa'}
                variant="ghost"
                onPress={() => toggleStatus(user)}
              />
              <Button label="Sửa" variant="ghost" onPress={() => handleEdit(user)} />
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
  active: {
    color: colors.success
  },
  inactive: {
    color: colors.danger
  },
  sortRow: {
    gap: spacing.sm
  },
  restaurantSection: {
    gap: spacing.sm
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  }
});

export default AdminUsersScreen;
