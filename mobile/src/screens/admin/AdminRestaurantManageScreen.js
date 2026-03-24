import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../styles/theme';
import { useRestaurants } from '../../hooks/useRestaurants';

const defaultRestaurantImage = 'foodfast-placeholder.svg';

const AdminRestaurantManageScreen = () => {
  const { restaurants, addRestaurant, deleteRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    newRestaurantName: '',
    newRestaurantAddress: '',
    newRestaurantImage: ''
  });

  const resetForm = () => {
    setForm({
      newRestaurantName: '',
      newRestaurantAddress: '',
      newRestaurantImage: ''
    });
    setShowForm(false);
  };

  const handleAddRestaurant = () => {
    if (!form.newRestaurantName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên nhà hàng.');
      return;
    }

    addRestaurant({
      name: form.newRestaurantName.trim(),
      address: form.newRestaurantAddress.trim(),
      image: form.newRestaurantImage.trim() || defaultRestaurantImage
    });

    Alert.alert('Thành công', `Nhà hàng "${form.newRestaurantName.trim()}" đã được thêm.`);
    resetForm();
  };

  const handleDeleteRestaurant = (restaurant) => {
    Alert.alert(
      'Xóa nhà hàng',
      `Bạn có chắc chắn muốn xóa ${restaurant.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(restaurant.id);
            } catch (error) {
              Alert.alert('Không thể xóa', error.message ?? 'Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <AppHeader title="Quản lý nhà hàng" subtitle="Thêm, xóa và quản lý danh sách nhà hàng." />

      <Card style={styles.formCard}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Danh sách nhà hàng</Text>
          <Button
            label="+ Thêm nhà hàng"
            variant="ghost"
            onPress={() => setShowForm(true)}
          />
        </View>

        {showForm ? (
          <View style={styles.addSection}>
            <Text style={styles.label}>Thêm nhà hàng mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên nhà hàng"
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
            <View style={styles.formActions}>
              <Button label="Thêm nhà hàng" onPress={handleAddRestaurant} />
              <Button label="Hủy" variant="ghost" onPress={resetForm} />
            </View>
          </View>
        ) : null}

        {restaurants.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có nhà hàng nào được tạo.</Text>
        ) : (
          restaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantRow}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.metaText}>{restaurant.address || 'Chưa cập nhật địa chỉ'}</Text>
                <Text style={styles.metaText}>{restaurant.contact || 'Chưa có liên hệ'}</Text>
              </View>
              <Button label="Xóa" variant="ghost" onPress={() => handleDeleteRestaurant(restaurant)} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  addSection: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  label: {
    color: colors.text,
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap'
  },
  emptyText: {
    color: colors.textMuted
  },
  restaurantRow: {
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
  restaurantInfo: {
    gap: spacing.xs,
    flex: 1
  },
  restaurantName: {
    color: colors.text,
    fontWeight: '600'
  },
  metaText: {
    color: colors.textMuted
  }
});

export default AdminRestaurantManageScreen;
