import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { categories, products as allProducts } from '../../data/mockProducts';
import { useAuth } from '../../hooks/useAuth';

const generateId = () => `p-${Math.random().toString(36).slice(2, 8)}`;

const RestaurantProductsScreen = () => {
  const { user } = useAuth();
  const restaurantName = user?.restaurantName ?? 'FastGrill Station';
  const [products, setProducts] = useState(
    allProducts.filter((product) => product.restaurant === restaurantName)
  );
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    description: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món và giá bán.');
      return;
    }

    const payload = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      restaurant: restaurantName,
      description: form.description.trim(),
      image: form.image.trim() || allProducts[0].image,
      rating: 4.5,
      deliveryTime: 12
    };

    setProducts((prev) => {
      if (editingId) {
        return prev.map((product) => (product.id === editingId ? payload : product));
      }
      return [payload, ...prev];
    });

    setForm({ name: '', price: '', category: categories[0], description: '', image: '' });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description,
      image: product.image
    });
    setEditingId(product.id);
  };

  const handleDelete = (product) => {
    Alert.alert('Xóa món', `Bạn có chắc chắn muốn xóa ${product.name}?`, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setProducts((prev) => prev.filter((item) => item.id !== product.id))
      }
    ]);
  };

  return (
    <Screen>
      <AppHeader title="Menu nhà hàng" subtitle="Quản lý món ăn dành riêng cho nhà hàng của bạn." />

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>{editingId ? 'Cập nhật món' : 'Thêm món mới'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên món"
          placeholderTextColor={colors.textMuted}
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá bán"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={form.price}
          onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
        />
        <View style={styles.categoryRow}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              active={form.category === category}
              onPress={() => setForm((prev) => ({ ...prev, category }))}
            />
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Mô tả"
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Liên kết hình ảnh"
          placeholderTextColor={colors.textMuted}
          value={form.image}
          onChangeText={(value) => setForm((prev) => ({ ...prev, image: value }))}
        />
        <Button label={editingId ? 'Lưu thay đổi' : 'Thêm món'} onPress={handleSubmit} />
        {editingId ? (
          <Button
            label="Hủy"
            variant="ghost"
            onPress={() => {
              setEditingId(null);
              setForm({ name: '', price: '', category: categories[0], description: '', image: '' });
            }}
          />
        ) : null}
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>Danh sách món</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>{product.category}</Text>
              <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.actions}>
              <Button label="Sửa" variant="ghost" onPress={() => handleEdit(product)} />
              <Button label="Xóa" variant="ghost" onPress={() => handleDelete(product)} />
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
  listCard: {
    gap: spacing.md
  },
  productRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  productInfo: {
    flex: 1,
    gap: spacing.xs
  },
  productName: {
    color: colors.text,
    fontWeight: '600'
  },
  productMeta: {
    color: colors.textMuted
  },
  productPrice: {
    color: colors.accent,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm
  }
});

export default RestaurantProductsScreen;
