import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Chip from '../components/Chip';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { colors, spacing } from '../styles/theme';
import { categories, products } from '../data/mockProducts';

const sortProducts = (list, sortKey) => {
  switch (sortKey) {
    case 'priceAsc':
      return [...list].sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return [...list].sort((a, b) => b.price - a.price);
    case 'rating':
      return [...list].sort((a, b) => b.rating - a.rating);
    case 'delivery':
      return [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
    default:
      return list;
  }
};

const sortOptions = [
  { label: 'Nổi bật', value: 'featured' },
  { label: 'Giá tăng dần', value: 'priceAsc' },
  { label: 'Giá giảm dần', value: 'priceDesc' },
  { label: 'Đánh giá cao', value: 'rating' },
  { label: 'Giao nhanh', value: 'delivery' }
];

const ProductsScreen = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [category, setCategory] = useState('all');
  const [restaurant, setRestaurant] = useState('all');

  const restaurants = useMemo(
    () => ['all', ...Array.from(new Set(products.map((product) => product.restaurant)))],
    []
  );

  const filteredItems = useMemo(() => {
    let list = products;

    if (category !== 'all') {
      list = list.filter((product) => product.category === category);
    }

    if (restaurant !== 'all') {
      list = list.filter((product) => product.restaurant === restaurant);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter((product) =>
        `${product.name} ${product.restaurant}`.toLowerCase().includes(lower)
      );
    }

    return sortProducts(list, sort);
  }, [category, restaurant, search, sort]);

  return (
    <Screen>
      <AppHeader
        title="Danh mục món ăn"
        subtitle="Khám phá menu theo danh mục và nhà hàng yêu thích của bạn."
      />

      <View style={styles.controls}>
        <TextInput
          style={styles.search}
          placeholder="Tìm kiếm món hoặc nhà hàng"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip label="Tất cả danh mục" active={category === 'all'} onPress={() => setCategory('all')} />
          {categories.map((item) => (
            <Chip
              key={item}
              label={item}
              active={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {restaurants.map((item) => (
            <Chip
              key={item}
              label={item === 'all' ? 'Tất cả nhà hàng' : item}
              active={restaurant === item}
              onPress={() => setRestaurant(item)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {sortOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={sort === option.value}
              onPress={() => setSort(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      {filteredItems.length === 0 ? (
        <EmptyState
          title="Không tìm thấy món ăn phù hợp"
          description="Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác."
        />
      ) : (
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  controls: {
    gap: spacing.md
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface
  },
  chipRow: {
    flexGrow: 0
  },
  grid: {
    gap: spacing.lg
  }
});

export default ProductsScreen;
