import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useRestaurants } from '../../hooks/useRestaurants';

const RestaurantProductsScreen = () => {
  const { user } = useAuth();
  const { restaurants } = useRestaurants();
  const restaurant = useMemo(
    () =>
      restaurants.find((item) => item.id === user?.restaurantId) ||
      restaurants.find((item) => item.name === user?.restaurantName) ||
      null,
    [restaurants, user?.restaurantId, user?.restaurantName]
  );
  const restaurantName = restaurant?.name ?? user?.restaurantName ?? '';
  const { products: allProducts, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    description: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = () => {
    if (!restaurantName) {
      Alert.alert('Chưa gán nhà hàng', 'Tài khoản của bạn chưa được gán vào nhà hàng cụ thể.');
      return;
    }

    if (!form.name.trim() || !form.price) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món và giá bán.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      restaurant: restaurantName,
      description: form.description.trim(),
      image: form.image.trim()
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

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
        onPress: () => deleteProduct(product.id)
      }
    ]);
  };

  useEffect(() => {
    if (!restaurantName) {
      setProducts([]);
      return;
    }
    setProducts(allProducts.filter((product) => product.restaurant === restaurantName));
  }, [allProducts, restaurantName]);

  return (
    <Screen>
      <AppHeader title="Menu nhà hàng" subtitle="Quản lý món ăn dành riêng cho nhà hàng của bạn." />

      {!restaurantName ? (
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Chưa gán nhà hàng</Text>
          <Text style={styles.productMeta}>
            Vui lòng liên hệ quản trị viên để gán tài khoản vào một nhà hàng trước khi quản lý món.
          </Text>
        </Card>
      ) : null}

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
