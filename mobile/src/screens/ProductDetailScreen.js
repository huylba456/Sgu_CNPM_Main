import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../styles/theme';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { resolveProductImage } from '../utils/resolveProductImage';
import { useProducts } from '../hooks/useProducts';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params ?? {};
  const { products } = useProducts();
  const product = useMemo(() => products.find((item) => item.id === productId), [productId, products]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!product) {
    return (
      <Screen>
        <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm đã bị xóa hoặc không tồn tại." />
      </Screen>
    );
  }

  const relatedProducts = useMemo(
    () =>
      products
        .filter((item) => item.category === product.category && item.id !== product.id)
        .slice(0, 3),
    [product, products]
  );

  const heroImage = resolveProductImage(product.image);

  return (
    <Screen>
      <AppHeader title={product.name} subtitle={product.restaurant} />

      <Card style={styles.hero}>
        <View style={styles.heroImageWrapper}>
          <Image source={heroImage} style={styles.image} resizeMode="cover" />
        </View>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Danh mục</Text>
            <Text style={styles.metaValue}>{product.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Đánh giá</Text>
            <Text style={styles.metaValue}>{product.rating.toFixed(1)}/5</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Giao hàng</Text>
            <Text style={styles.metaValue}>{product.deliveryTime} phút</Text>
          </View>
        </View>
        <Button
          label={user ? 'Thêm vào giỏ hàng' : 'Đăng nhập để đặt món'}
          onPress={() => {
            if (!user) {
              navigation.navigate('Login');
              return;
            }
            addToCart(product);
          }}
        />
      </Card>

      {relatedProducts.length ? (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Gợi ý cùng danh mục</Text>
          <View style={styles.relatedList}>
            {relatedProducts.map((item) => (
              <Card key={item.id} style={styles.relatedCard}>
                <View style={styles.relatedImageWrapper}>
                  <Image
                    source={resolveProductImage(item.image)}
                    style={styles.relatedImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.relatedName}>{item.name}</Text>
                <Button
                  label="Xem chi tiết"
                  variant="ghost"
                  onPress={() => navigation.replace('ProductDetail', { productId: item.id })}
                />
              </Card>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md
  },
  image: {
    width: '100%',
    height: 220
  },
  heroImageWrapper: {
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    overflow: 'hidden'
  },
  price: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: '700'
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg
  },
  metaItem: {
    gap: spacing.xs
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  metaValue: {
    color: colors.text,
    fontWeight: '600'
  },
  relatedSection: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  relatedList: {
    gap: spacing.md
  },
  relatedCard: {
    gap: spacing.sm
  },
  relatedImage: {
    width: '100%',
    height: 120
  },
  relatedImageWrapper: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden'
  },
  relatedName: {
    color: colors.text,
    fontWeight: '600'
  }
});

export default ProductDetailScreen;
