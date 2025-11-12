import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import ProductCard from '../components/ProductCard';
import StatHighlight from '../components/StatHighlight';
import Button from '../components/Button';
import { colors, spacing, typography } from '../styles/theme';
import { products } from '../data/mockProducts';

const HomeScreen = ({ navigation }) => {
  const featuredProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6),
    []
  );

  return (
    <Screen>
      <AppHeader
        title="FoodFast Drone Delivery"
        subtitle="Trải nghiệm giao đồ ăn trong 15 phút với đội drone tự động của FoodFast."
      />

      <Card style={styles.hero}>
        <Text style={styles.heroBadge}>Đội drone tự động thế hệ mới</Text>
        <Text style={styles.heroTitle}>Theo dõi realtime, món nóng hổi trên tay bạn</Text>
        <Text style={styles.heroText}>
          FoodFast mang đến trải nghiệm giao đồ ăn bằng drone với tốc độ trung bình 15 phút, theo
          dõi hành trình trực tiếp và chuẩn bị món ăn bởi các nhà hàng hàng đầu thành phố.
        </Text>
        <View style={styles.heroStats}>
          <StatHighlight label="Thời gian giao" value="15 phút" helpText="Trung bình" />
          <StatHighlight label="Món phục vụ" value="120+" tone="accent" helpText="Cập nhật mỗi ngày" />
          <StatHighlight label="Độ hài lòng" value="98%" tone="success" helpText="Khách hàng đánh giá" />
        </View>
        <View style={styles.heroActions}>
          <Button label="Xem thực đơn" onPress={() => navigation.navigate('Products')} />
          <Button
            label="Đặt ngay"
            variant="ghost"
            onPress={() => navigation.navigate('Products')}
          />
        </View>
      </Card>

      <View style={styles.highlightHeader}>
        <View>
          <Text style={styles.sectionTitle}>Nổi bật</Text>
          <Text style={styles.muted}>Những món được đánh giá cao nhất bởi khách hàng FoodFast.</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md
  },
  heroBadge: {
    color: colors.accent,
    fontSize: typography.small,
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700'
  },
  heroText: {
    color: colors.textMuted,
    lineHeight: 22
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  muted: {
    color: colors.textMuted
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  grid: {
    gap: spacing.md
  }
});

export default HomeScreen;
