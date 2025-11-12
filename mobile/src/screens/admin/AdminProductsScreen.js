import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { categories, products as seedProducts } from '../../data/mockProducts';

const generateId = () => `p-${Math.random().toString(36).slice(2, 8)}`;

const AdminProductsScreen = () => {
  const [products, setProducts] = useState(seedProducts);
  const [category, setCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    restaurant: '',
    description: '',
    image: ''
  });

  const filtered = products.filter((product) => category === 'all' || product.category === category);

  const resetForm = () => {
    setForm({ name: '', price: '', category: categories[0], restaurant: '', description: '', image: '' });
    setEditingId(null);
  };

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
      restaurant: form.restaurant.trim() || 'FoodFast Restaurant',
      description: form.description.trim(),
      image: form.image.trim() || seedProducts[0].image,
      rating: 4.5,
      deliveryTime: 12
    };

    setProducts((prev) => {
      if (editingId) {
        return prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item));
      }
      return [payload, ...prev];
    });
    resetForm();
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      restaurant: product.restaurant,
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
      <AppHeader title="Quản lý sản phẩm" subtitle="Thêm, chỉnh sửa món ăn trên hệ thống." />

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>{editingId ? 'Cập nhật món ăn' : 'Thêm món mới'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên món"
          placeholderTextColor={colors.textMuted}
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Giá bán"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.price}
            onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Nhà hàng"
            placeholderTextColor={colors.textMuted}
            value={form.restaurant}
            onChangeText={(value) => setForm((prev) => ({ ...prev, restaurant: value }))}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Danh mục</Text>
          <View style={styles.categoryRow}>
            {categories.map((item) => (
              <Chip
                key={item}
                label={item}
                active={form.category === item}
                onPress={() => setForm((prev) => ({ ...prev, category: item }))}
              />
            ))}
          </View>
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
        {editingId ? <Button label="Hủy" variant="ghost" onPress={resetForm} /> : null}
      </Card>

      <Card style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Danh sách món</Text>
        <View style={styles.categoryRow}>
          <Chip label="Tất cả" active={category === 'all'} onPress={() => setCategory('all')} />
          {categories.map((item) => (
            <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
          ))}
        </View>
        {filtered.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>
                {product.category} • {product.restaurant}
              </Text>
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
  row: {
    gap: spacing.sm
  },
  half: {
    flex: 1
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  filterCard: {
    gap: spacing.md
  },
  productRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
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

export default AdminProductsScreen;
