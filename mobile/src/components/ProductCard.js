import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Card from './Card';
import Button from './Button';
import { colors, radius, spacing, typography } from '../styles/theme';
import { resolveProductImage } from '../utils/resolveProductImage';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isGuest = !user;
  const imageSource = resolveProductImage(product.image);

  return (
    <Card style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.restaurant}>{product.restaurant}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
          <View style={styles.actions}>
            <Button
              label="Chi tiết"
              variant="ghost"
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            />
            <Button
              label="Thêm"
              onPress={() => addToCart(product)}
              disabled={isGuest}
              style={styles.addButton}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.md
  },
  image: {
    width: '100%',
    height: 160
  },
  imageWrapper: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    overflow: 'hidden'
  },
  body: {
    gap: spacing.xs
  },
  name: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '600'
  },
  restaurant: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  footer: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  price: {
    color: colors.accent,
    fontSize: typography.subtitle,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  addButton: {
    flex: 1
  }
});

export default ProductCard;
