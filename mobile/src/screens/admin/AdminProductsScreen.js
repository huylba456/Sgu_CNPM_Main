import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../styles/theme';
import { useProducts } from '../../hooks/useProducts';
import { useRestaurants } from '../../hooks/useRestaurants';

const AdminProductsScreen = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const { restaurants } = useRestaurants();
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0],
    restaurant: restaurants[0]?.name ?? '',
    description: '',
    image: ''
  });
  const [showRestaurantList, setShowRestaurantList] = useState(false);

  const filtered = products
    .filter((product) => category === 'all' || product.category === category)
    .filter((product) => {
      const keyword = searchTerm.toLowerCase();
      return (
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.restaurant.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      if (sortKey === 'price') {
        return (a.price - b.price) * direction;
      }
      return 0;
    });

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      category: categories[0],
      restaurant: restaurants[0]?.name ?? '',
      description: '',
      image: ''
    });
    setEditingId(null);
    setShowRestaurantList(false);
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, restaurant: prev.restaurant || restaurants[0]?.name || '' }));
  }, [restaurants]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món và giá bán.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      restaurant: form.restaurant.trim() || 'FoodFast Restaurant',
      description: form.description.trim(),
      image: form.image.trim()
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
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
    setShowRestaurantList(false);
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
          <View style={[styles.half, styles.dropdown]}> 
            <Text style={styles.label}>Nhà hàng</Text>
            <Pressable
              style={styles.dropdownToggle}
              onPress={() => setShowRestaurantList((prev) => !prev)}
            >
              <Text style={styles.dropdownValue} numberOfLines={1}>
                {form.restaurant || 'Chọn nhà hàng'}
              </Text>
            </Pressable>
            {showRestaurantList ? (
              <View style={styles.dropdownList}>
                {restaurants.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.dropdownOption,
                      form.restaurant === item.name && styles.dropdownOptionActive
                    ]}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, restaurant: item.name }));
                      setShowRestaurantList(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionLabel,
                        form.restaurant === item.name && styles.dropdownOptionLabelActive
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
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
        <TextInput
          style={styles.input}
          placeholder="Tìm theo tên món hoặc nhà hàng"
          placeholderTextColor={colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.sortRow}>
          <Text style={styles.label}>Sắp xếp theo:</Text>
          <Chip label="Tên" active={sortKey === 'name'} onPress={() => setSortKey('name')} />
          <Chip label="Giá" active={sortKey === 'price'} onPress={() => setSortKey('price')} />
          <Button
            label={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            variant="ghost"
            onPress={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          />
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
  dropdown: {
    gap: spacing.xs
  },
  dropdownToggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface
  },
  dropdownValue: {
    color: colors.text,
    fontWeight: '600'
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
    overflow: 'hidden'
  },
  dropdownOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  dropdownOptionActive: {
    backgroundColor: colors.background
  },
  dropdownOptionLabel: {
    color: colors.text
  },
  dropdownOptionLabelActive: {
    color: colors.accent,
    fontWeight: '700'
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap'
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  }
});

export default AdminProductsScreen;
